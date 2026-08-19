import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate, validateBody, validateQuery } from '../../src/core/middleware/validate';
import { AppError } from '../../src/core/exceptions/errorHandler';
import { logTestStart, logTestEnd, logTestStep, logTestAssertion } from '../utils/testHelpers';
import testLogger from '../utils/testLogger';

describe('Validate Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    testLogger.clearContext();
    logTestStep('Setting up test mocks', { suite: 'Validate Middleware' });
    mockRequest = {
      body: {},
      query: {},
      params: {},
    };
    mockResponse = {};
    mockNext = vi.fn();
  });

  afterEach(() => {
    testLogger.clearContext();
  });

  describe('validate', () => {
    it('should pass validation for valid data', () => {
      const testName = 'should pass validation for valid data';
      logTestStart(testName, 'validate');
      
      const schema = z.object({
        body: z.object({
          email: z.string().email(),
          name: z.string(),
        }),
      });

      mockRequest.body = {
        email: 'test@example.com',
        name: 'Test User',
      };

      logTestStep('Created schema and mock request body', { body: mockRequest.body });

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const passed = mockNext.mock.calls.length > 0 && mockNext.mock.calls[0][0] === undefined;
      logTestAssertion('next() called without error', passed, { 
        called: mockNext.mock.calls.length > 0,
        withError: mockNext.mock.calls[0]?.[0] !== undefined 
      });
      
      expect(mockNext).toHaveBeenCalledWith();
      logTestEnd(testName, 'passed');
    });

    it('should fail validation for invalid data', () => {
      const testName = 'should fail validation for invalid data';
      logTestStart(testName, 'validate');
      
      const schema = z.object({
        body: z.object({
          email: z.string().email(),
          name: z.string(),
        }),
      });

      mockRequest.body = {
        email: 'invalid-email',
        name: 'Test User',
      };

      logTestStep('Created schema with invalid email', { body: mockRequest.body });

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = (mockNext as ReturnType<typeof vi.fn>).mock.calls[0][0] as AppError;
      
      logTestAssertion('next() called with AppError', error instanceof AppError, {
        errorMessage: error.message,
        statusCode: error.statusCode,
        hasErrors: !!error.errors
      });
      
      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.errors).toBeDefined();
      logTestEnd(testName, 'passed');
    });

    it('should validate query parameters', () => {
      const schema = z.object({
        query: z.object({
          page: z.string().transform(Number),
          limit: z.string().transform(Number),
        }),
      });

      mockRequest.query = {
        page: '1',
        limit: '10',
      };

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should validate params', () => {
      const schema = z.object({
        params: z.object({
          id: z.string().min(1),
        }),
      });

      mockRequest.params = {
        id: '123',
      };

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('validateBody', () => {
    it('should pass validation and update req.body with parsed data', () => {
      const schema = z.object({
        email: z.string().email(),
        name: z.string().min(1),
      });

      mockRequest.body = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const middleware = validateBody(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.body).toEqual({
        email: 'test@example.com',
        name: 'Test User',
      });
    });

    it('should fail validation for invalid body', () => {
      const schema = z.object({
        email: z.string().email(),
        name: z.string().min(1),
      });

      mockRequest.body = {
        email: 'invalid-email',
        name: '',
      };

      const middleware = validateBody(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = (mockNext as ReturnType<typeof vi.fn>).mock.calls[0][0] as AppError;
      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.errors).toBeDefined();
      expect(error.errors?.length).toBeGreaterThan(0);
    });

    it('should transform data according to schema', () => {
      const schema = z.object({
        email: z.string().email().transform((val) => val.toLowerCase()),
        age: z.string().transform(Number),
      });

      mockRequest.body = {
        email: 'TEST@EXAMPLE.COM',
        age: '25',
      };

      const middleware = validateBody(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.body.email).toBe('test@example.com');
      expect(mockRequest.body.age).toBe(25);
    });
  });

  describe('validateQuery', () => {
    it('should pass validation for valid query', () => {
      const schema = z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
      });

      mockRequest.query = {
        page: '1',
        limit: '10',
      };

      const middleware = validateQuery(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should fail validation for invalid query', () => {
      const schema = z.object({
        page: z.string().regex(/^\d+$/),
        limit: z.string().regex(/^\d+$/),
      });

      mockRequest.query = {
        page: 'invalid',
        limit: '10',
      };

      const middleware = validateQuery(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = (mockNext as ReturnType<typeof vi.fn>).mock.calls[0][0] as AppError;
      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
    });

    it('should handle optional query parameters', () => {
      const schema = z.object({
        search: z.string().optional(),
        filter: z.string().optional(),
      });

      mockRequest.query = {};

      const middleware = validateQuery(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });
});

