import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { AppError, errorHandler } from '../error-handler';

function createMockRes(): Response {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

describe('AppError', () => {
  it('should create an AppError with all fields', () => {
    const err = new AppError(400, 'BAD_REQUEST', 'Something went wrong', { field: 'email' });
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('BAD_REQUEST');
    expect(err.message).toBe('Something went wrong');
    expect(err.details).toEqual({ field: 'email' });
    expect(err.name).toBe('AppError');
  });
});

describe('errorHandler middleware', () => {
  const req = {} as Request;
  const next = vi.fn() as NextFunction;

  it('should handle AppError with correct status and body', () => {
    const res = createMockRes();
    const err = new AppError(422, 'VALIDATION_ERROR', 'Invalid input', { field: 'name' });

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: { field: 'name' },
      },
    });
  });

  it('should handle generic Error with 500 status', () => {
    const res = createMockRes();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const err = new Error('Something broke');

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    });
    consoleSpy.mockRestore();
  });
});
