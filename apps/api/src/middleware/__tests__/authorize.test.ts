import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { authorize } from '../authorize';
import { UserRole } from '@marketmosaic/shared';
import { JwtPayload } from '../../lib/jwt';

function createMockReq(user?: JwtPayload): Request {
  return { user } as unknown as Request;
}

function createMockRes(): Response {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

describe('authorize middleware', () => {
  let next: NextFunction;

  beforeEach(() => {
    next = vi.fn();
  });

  it('should call next when user has permission', () => {
    const req = createMockReq({
      user_id: 'u1',
      email: 'admin@test.com',
      role: UserRole.admin,
    });
    const res = createMockRes();

    authorize('client', 'create')(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should return 403 when user lacks permission', () => {
    const req = createMockReq({
      user_id: 'u1',
      email: 'viewer@test.com',
      role: UserRole.viewer,
    });
    const res = createMockRes();

    authorize('client', 'create')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'FORBIDDEN', message: 'Insufficient permissions for create on client' },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when no user on request', () => {
    const req = createMockReq();
    const res = createMockRes();

    authorize('client', 'read')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should attach rowFilter for team-scoped roles', () => {
    const req = createMockReq({
      user_id: 'u1',
      email: 'servicer@test.com',
      role: UserRole.servicer,
    });
    const res = createMockRes();

    authorize('client', 'read')(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.rowFilter).toBe('team');
  });

  it('should not set rowFilter for admin', () => {
    const req = createMockReq({
      user_id: 'u1',
      email: 'admin@test.com',
      role: UserRole.admin,
    });
    const res = createMockRes();

    authorize('client', 'read')(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.rowFilter).toBeUndefined();
  });
});
