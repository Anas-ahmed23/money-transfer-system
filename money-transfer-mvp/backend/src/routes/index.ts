import { Router } from 'express';
import accountRouter from './account.routes';
import transferRouter from './transfer.routes';

const router = Router();

router.use('/accounts', accountRouter);
router.use('/transfer', transferRouter);

export default router;
