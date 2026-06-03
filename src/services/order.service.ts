import { PrismaClient, OrderStatus } from '@prisma/client';
import { AppError } from '../middlewares/AppError';

const prisma = new PrismaClient();

interface OrderItemInput {
  productId: number;
  quantity: number;
}

export class OrderService {
  async create(operatorId: number, items: OrderItemInput[]) {
    return prisma.$transaction(async (tx) => {
      // Verify stock for every item
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) {
          throw new AppError(`Product ${item.productId} not found`, 404);
        }
        if (product.stock < item.quantity) {
          throw new AppError(
            `Insufficient stock for product "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`,
            400
          );
        }
      }

      // Deduct stock and build order items
      const orderItemsData: { productId: number; quantity: number; priceAtOrder: number }[] = [];
      for (const item of items) {
        const product = await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          priceAtOrder: product.price,
        });
      }

      // Create order and its items
      return tx.order.create({
        data: {
          operatorId,
          items: { create: orderItemsData },
        },
        include: {
          items: { include: { product: true } },
          operator: { select: { id: true, email: true, role: true } },
        },
      });
    });
  }

  async findById(id: number) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: { include: { category: true } } } },
        operator: { select: { id: true, email: true, role: true } },
      },
    });
    if (!order) throw new AppError('Order not found', 404);
    return order;
  }

  async updateStatus(id: number, status: OrderStatus) {
    const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) throw new AppError('Order not found', 404);

    if (order.status === 'CANCELLED') {
      throw new AppError('Cannot update a cancelled order', 400);
    }
    if (order.status === 'DISPATCHED' && status !== 'CANCELLED') {
      throw new AppError('A dispatched order can only be cancelled', 400);
    }

    return prisma.$transaction(async (tx) => {
      // Reintegrate stock if cancelling
      if (status === 'CANCELLED') {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      return tx.order.update({
        where: { id },
        data: { status },
        include: {
          items: { include: { product: true } },
          operator: { select: { id: true, email: true, role: true } },
        },
      });
    });
  }
}
