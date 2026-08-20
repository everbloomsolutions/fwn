import { Request, Response, NextFunction } from 'express';
import * as categoryService from './category.service';
import { AppError } from '../../core/exceptions/errorHandler';

interface AuthenticatedRequest extends Request {
  user?: Express.User;
}

export const getCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await categoryService.getCategories(true);
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const getCategoryBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const category = await categoryService.getCategoryBySlug(req.params.slug);
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json({ success: true, data: category, message: 'Category created' });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    res.status(200).json({ success: true, data: category, message: 'Category updated' });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const category = await categoryService.deleteCategory(req.params.id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};
