import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  stock: z.number().int().min(0, 'Stock must be >= 0'),
  minStock: z.number().int().min(0, 'Min stock must be >= 0'),
  price: z.number().positive('Price must be positive'),
  categoryId: z.number().int().positive('categoryId is required'),
});

export const updateProductSchema = createProductSchema.partial();
