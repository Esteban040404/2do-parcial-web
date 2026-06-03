import { Router } from 'express';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStock,
} from '../controllers/product.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleGuard } from '../middlewares/roleGuard';
import { validateRequest } from '../middlewares/validateRequest';
import { createProductSchema, updateProductSchema } from '../validations/product.schemas';

const router = Router();

// Any authenticated user can list products
router.get('/', authMiddleware, getProducts);

// ADMIN only
router.post('/', authMiddleware, roleGuard(['ADMIN']), validateRequest(createProductSchema), createProduct);
router.put('/:id', authMiddleware, roleGuard(['ADMIN']), validateRequest(updateProductSchema), updateProduct);
router.delete('/:id', authMiddleware, roleGuard(['ADMIN']), deleteProduct);

export default router;
