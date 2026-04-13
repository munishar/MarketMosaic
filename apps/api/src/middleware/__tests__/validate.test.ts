import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { validate } from '../validate';
import { z } from 'zod';

const testSchema = z.object({
  name: z.string().min(1),
  age: z.number().int().positive(),
});

function createMockReq(body: unknown): Request {
  return { body } as unknown as Request;
}

function createMockRes(): Response {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

describe('validate middleware', () => {
  let next: NextFunction;

  beforeEach(() => {
    next = vi.fn();
  });

  it('should call next for valid body', () => {
    const req = createMockReq({ name: 'John', age: 30 });
    const res = createMockRes();

    validate(testSchema)(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.body).toEqual({ name: 'John', age: 30 });
  });

  it('should return 400 for invalid body', () => {
    const req = createMockReq({ name: '', age: -1 });
    const res = createMockRes();

    validate(testSchema)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
        }),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 400 for missing required fields', () => {
    const req = createMockReq({});
    const res = createMockRes();

    validate(testSchema)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('should strip unknown fields', () => {
    const req = createMockReq({ name: 'Jane', age: 25, extra: 'field' });
    const res = createMockRes();

    validate(testSchema)(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.body).toEqual({ name: 'Jane', age: 25 });
  });

  it('should validate query params when source is query', () => {
    const querySchema = z.object({ search: z.string().optional() });
    const req = { query: { search: 'test' } } as unknown as Request;
    const res = createMockRes();

    validate(querySchema, 'query')(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
