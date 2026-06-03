import { z } from 'zod';

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.number().int().positive('productId must be a positive integer'),
        quantity: z.number().int().min(1, 'quantity must be at least 1'),
      })
    )
    .min(1, 'Order must have at least one item'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'DISPATCHED', 'CANCELLED']),
});
