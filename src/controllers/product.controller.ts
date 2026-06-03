import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';

const productService = new ProductService();

export async function getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categoryId = req.query['categoryId'] ? Number(req.query['categoryId']) : undefined;
    const products = await productService.findAll(categoryId);
    res.status(200).json({ products });
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await productService.create(req.body);
    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params['id']);
    const product = await productService.update(id, req.body);
    res.status(200).json({ product });
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params['id']);
    await productService.delete(id);
    res.status(200).json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
}

export async function getLowStock(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const products = await productService.getLowStock();
    res.status(200).json({ products });
  } catch (err) {
    next(err);
  }
}
