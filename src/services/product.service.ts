import { PrismaClient } from '@prisma/client';
import { AppError } from '../middlewares/AppError';

const prisma = new PrismaClient();

interface ProductData {
  name?: string;
  sku?: string;
  stock?: number;
  minStock?: number;
  price?: number;
  categoryId?: number;
}

export class ProductService {
  async findAll(categoryId?: number) {
    return prisma.product.findMany({
      where: categoryId ? { categoryId } : undefined,
      include: { category: true },
    });
  }

  async create(data: Required<ProductData>) {
    const skuExists = await prisma.product.findUnique({ where: { sku: data.sku } });
    if (skuExists) throw new AppError('SKU already exists', 400);

    const categoryExists = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!categoryExists) throw new AppError('Category not found', 404);

    return prisma.product.create({ data, include: { category: true } });
  }

  async update(id: number, data: ProductData) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new AppError('Product not found', 404);

    if (data.categoryId) {
      const categoryExists = await prisma.category.findUnique({ where: { id: data.categoryId } });
      if (!categoryExists) throw new AppError('Category not found', 404);
    }

    return prisma.product.update({ where: { id }, data, include: { category: true } });
  }

  async delete(id: number) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new AppError('Product not found', 404);
    await prisma.product.delete({ where: { id } });
  }

  async getLowStock() {
    const products = await prisma.product.findMany({ include: { category: true } });
    return products.filter((p) => p.stock <= p.minStock);
  }
}
