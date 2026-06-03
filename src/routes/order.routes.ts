import { Router } from 'express';
import { createOrder, getOrder, updateOrderStatus } from '../controllers/order.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { createOrderSchema, updateOrderStatusSchema } from '../validations/order.schemas';

const router = Router();

router.post('/', authMiddleware, validateRequest(createOrderSchema), createOrder);
router.get('/:id', authMiddleware, getOrder);
router.patch('/:id/status', authMiddleware, validateRequest(updateOrderStatusSchema), updateOrderStatus);

export default router;
