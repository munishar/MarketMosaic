import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { rateLimit, _clearStore } from '../rate-limit';

function createMockReq(ip = '127.0.0.1'): Request {
  return { ip } as unknown as Request;
}

function createMockRes(): Response {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

describe('rateLimit middleware', () => {
  let next: NextFunction;

  beforeEach(() => {
    next = vi.fn();
    _clearStore();
  });

  it('should allow requests under the limit', () => {
    const middleware = rateLimit(60000, 3);
    const req = createMockReq();
    const res = createMockRes();

    middleware(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);

    middleware(req, res, next);
    expect(next).toHaveBeenCalledTimes(2);

    middleware(req, res, next);
    expect(next).toHaveBeenCalledTimes(3);
  });

  it('should block requests over the limit', () => {
    const middleware = rateLimit(60000, 2);
    const req = createMockReq();
    const res = createMockRes();

    middleware(req, res, next); // 1
    middleware(req, res, next); // 2
    middleware(req, res, next); // 3 - should be blocked

    expect(next).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later',
      },
    });
  });

  it('should track different IPs independently', () => {
    const middleware = rateLimit(60000, 1);
    const req1 = createMockReq('1.1.1.1');
    const req2 = createMockReq('2.2.2.2');
    const res = createMockRes();

    middleware(req1, res, next);
    middleware(req2, res, next);

    expect(next).toHaveBeenCalledTimes(2);
  });

  it('should reset after window expires', () => {
    vi.useFakeTimers();
    const windowMs = 1000;
    const middleware = rateLimit(windowMs, 1);
    const req = createMockReq();
    const res = createMockRes();

    middleware(req, res, next); // 1 - allowed
    middleware(req, res, next); // 2 - blocked

    expect(next).toHaveBeenCalledTimes(1);

    // Advance time past the window
    vi.advanceTimersByTime(windowMs + 1);

    middleware(req, res, next); // should be allowed again

    expect(next).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});
