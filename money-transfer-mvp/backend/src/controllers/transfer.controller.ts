import { Request, Response, NextFunction } from 'express';
import { TransferService } from '../services/transfer.service';
import { createTransferSchema } from '../validation/transfer.validation';
import { AppError } from '../middleware/error.middleware';

const transferService = new TransferService();

export async function createTransfer(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = createTransferSchema.safeParse(req.body);

    if (!parsed.success) {
      const message = parsed.error.errors.map((e) => e.message).join(', ');
      throw new AppError(message, 422, 'VALIDATION_ERROR');
    }

    const transfer = await transferService.createTransfer(parsed.data);
    res.status(201).json({ success: true, data: transfer });
  } catch (err) {
    next(err);
  }
}

export async function getTransferById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const transfer = await transferService.findById(id);
    res.json({ success: true, data: transfer });
  } catch (err) {
    next(err);
  }
}
