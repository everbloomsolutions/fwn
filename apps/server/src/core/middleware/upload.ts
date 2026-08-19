import { Request, Response, NextFunction, RequestHandler } from 'express';
import multer from 'multer';
import { AppError } from '../exceptions/errorHandler';

// Configure multer to use memory storage
const storage = multer.memoryStorage();

// File filter for images
const imageFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  // Allowed image MIME types
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`Invalid file type. Only ${allowedMimes.join(', ')} are allowed.`, 400));
  }
};

// File size limit: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

export const uploadSingle = (fieldName: string = 'image'): RequestHandler => {
  return multer({
    storage,
    fileFilter: imageFilter,
    limits: {
      fileSize: MAX_FILE_SIZE,
    },
  }).single(fieldName);
};

export const uploadMultiple = (fieldName: string = 'images', maxCount: number = 10): RequestHandler => {
  return multer({
    storage,
    fileFilter: imageFilter,
    limits: {
      fileSize: MAX_FILE_SIZE,
      files: maxCount,
    },
  }).array(fieldName, maxCount);
};

// Middleware to handle multer errors
export const handleUploadError = (
  err: unknown,
  _req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('File size exceeds the maximum limit of 5MB', 400));
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return next(new AppError('Too many files uploaded', 400));
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(new AppError('Unexpected file field', 400));
    }
    return next(new AppError(`Upload error: ${err.message}`, 400));
  }

  if (err instanceof Error) {
    return next(new AppError(`Upload error: ${err.message}`, 400));
  }

  next(err);
};
