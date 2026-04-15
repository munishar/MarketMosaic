import { describe, it, expect } from 'vitest';
import { signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken, JwtPayload } from '../jwt';
import { UserRole } from '@marketmosaic/shared';

const testPayload: JwtPayload = {
  user_id: '123',
  email: 'test@example.com',
  role: UserRole.admin,
  team_id: 'team-1',
  region: 'northeast',
};

describe('JWT utilities', () => {
  describe('signAccessToken / verifyAccessToken', () => {
    it('should sign and verify a valid access token', () => {
      const token = signAccessToken(testPayload);
      expect(typeof token).toBe('string');

      const decoded = verifyAccessToken(token);
      expect(decoded.user_id).toBe(testPayload.user_id);
      expect(decoded.email).toBe(testPayload.email);
      expect(decoded.role).toBe(testPayload.role);
      expect(decoded.team_id).toBe(testPayload.team_id);
      expect(decoded.region).toBe(testPayload.region);
    });

    it('should throw on invalid access token', () => {
      expect(() => verifyAccessToken('invalid-token')).toThrow();
    });

    it('should throw when verifying access token with refresh secret', () => {
      const refreshToken = signRefreshToken(testPayload);
      expect(() => verifyAccessToken(refreshToken)).toThrow();
    });
  });

  describe('signRefreshToken / verifyRefreshToken', () => {
    it('should sign and verify a valid refresh token', () => {
      const token = signRefreshToken(testPayload);
      expect(typeof token).toBe('string');

      const decoded = verifyRefreshToken(token);
      expect(decoded.user_id).toBe(testPayload.user_id);
      expect(decoded.email).toBe(testPayload.email);
      expect(decoded.role).toBe(testPayload.role);
    });

    it('should throw on invalid refresh token', () => {
      expect(() => verifyRefreshToken('invalid-token')).toThrow();
    });

    it('should throw when verifying refresh token with access secret', () => {
      const accessToken = signAccessToken(testPayload);
      expect(() => verifyRefreshToken(accessToken)).toThrow();
    });
  });

  describe('token payload without optional fields', () => {
    it('should handle payload without team_id and region', () => {
      const minPayload: JwtPayload = {
        user_id: '456',
        email: 'min@example.com',
        role: UserRole.viewer,
      };
      const token = signAccessToken(minPayload);
      const decoded = verifyAccessToken(token);
      expect(decoded.user_id).toBe('456');
      expect(decoded.email).toBe('min@example.com');
      expect(decoded.role).toBe(UserRole.viewer);
    });
  });
});
