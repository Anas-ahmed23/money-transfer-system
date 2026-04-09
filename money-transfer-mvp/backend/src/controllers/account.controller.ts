import { Request, Response, NextFunction } from 'express';
import { AccountService } from '../services/account.service';

const accountService = new AccountService();

export async function getAccounts(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const accounts = await accountService.findAll();
    res.json({ success: true, data: accounts });
  } catch (err) {
    next(err);
  }
}
