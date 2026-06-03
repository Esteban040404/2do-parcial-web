import { Router } from 'express';
import { getLowStock } from '../controllers/product.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleGuard } from '../middlewares/roleGuard';

const router = Router();

router.get('/low-stock', authMiddleware, roleGuard(['ADMIN']), getLowStock);

export default router;
