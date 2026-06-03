import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { AppError } from '../middlewares/AppError';
import { OrderStatus } from '@prisma/client';

const orderService = new OrderService();

export async function createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) return next(new AppError('Unauthorized', 401));
    const order = await orderService.create(req.user.id, req.body.items);
    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
}

export async function getOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params['id']);
    const order = await orderService.findById(id);
    res.status(200).json({ order });
  } catch (err) {
    next(err);
  }
}

export async function updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params['id']);
    const { status } = req.body as { status: OrderStatus };
    const order = await orderService.updateStatus(id, status);
    res.status(200).json({ order });
  } catch (err) {
    next(err);
  }
}
