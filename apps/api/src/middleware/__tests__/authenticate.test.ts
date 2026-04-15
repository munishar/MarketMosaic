import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { authenticate } from '../authenticate';
import { UserRole } from '@brokerflow/shared';

vi.mock('../../lib/jwt', () => ({
  verifyAccessToken: vi.fn((token: string) => {
    if (token === 'valid-token') {
      return {
        user_id: 'user-1',
        email: 'test@example.com',
        role: UserRole.admin,
        team_id: 'team-1',
      };
    }
    throw new Error('Invalid token');
  }),
}));

function createMockReq(headers: Record<string, string> = {}): Request {
  return { headers } as unknown as Request;
}

function createMockRes(): Response {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

describe('authenticate middleware', () => {
  let next: NextFunction;

  beforeEach(() => {
    next = vi.fn();
  });

  it('should set req.user and call next for valid token', () => {
    const req = createMockReq({ authorization: 'Bearer valid-token' });
    const res = createMockRes();

    authenticate(req, res, next);

    expect(req.user).toBeDefined();
    expect(req.user!.user_id).toBe('user-1');
    expect(req.user!.email).toBe('test@example.com');
    expect(next).toHaveBeenCalled();
  });

  it('should return 401 when no authorization header', () => {
    const req = createMockReq();
    const res = createMockRes();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'UNAUTHORIZED', message: 'Missing or invalid authorization header' },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when authorization header does not start with Bearer', () => {
    const req = createMockReq({ authorization: 'Basic abc' });
    const res = createMockRes();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 for invalid token', () => {
    const req = createMockReq({ authorization: 'Bearer bad-token' });
    const res = createMockRes();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' },
    });
    expect(next).not.toHaveBeenCalled();
  });
});
