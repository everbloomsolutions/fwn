import { Request, Response, NextFunction } from 'express';
import * as productService from './product.service';
import { AppError } from '../../core/exceptions/errorHandler';

interface AuthenticatedRequest extends Request {
  user?: Express.User;
}

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filters: productService.GetProductsFilters = {
      category: req.query.category as string | undefined,
      active: req.query.active !== undefined ? req.query.active === 'true' : true,
      search: req.query.search as string | undefined,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      unit: req.query.unit as string | undefined,
      inStock: req.query.inStock === 'true',
      isBestSeller: req.query.isBestSeller === 'true',
      sort: (req.query.sort as productService.GetProductsFilters['sort']) || undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };
    const products = await productService.getProducts(filters);
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await productService.getProductBySlug(req.params.slug);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json({ success: true, data: product, message: 'Product created' });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    res.status(200).json({ success: true, data: product, message: 'Product updated' });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await productService.deleteProduct(req.params.id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

export const updateProductInventory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await productService.updateProductInventory(req.params.id, req.body.variants);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    res.status(200).json({ success: true, data: product, message: 'Inventory updated' });
  } catch (error) {
    next(error);
  }
};
