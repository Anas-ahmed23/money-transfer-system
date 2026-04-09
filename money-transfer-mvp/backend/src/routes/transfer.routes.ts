import { Router } from 'express';
import { createTransfer, getTransferById } from '../controllers/transfer.controller';

const router = Router();

router.post('/', createTransfer);
router.get('/:id', getTransferById);

export default router;
