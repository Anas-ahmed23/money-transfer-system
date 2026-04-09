import { Router } from 'express';
import { getAccounts } from '../controllers/account.controller';

const router = Router();

router.get('/', getAccounts);

export default router;
