import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword } from '../password';

describe('Password utilities', () => {
  it('should hash a password and return a bcrypt hash', async () => {
    const hash = await hashPassword('myPassword123');
    expect(typeof hash).toBe('string');
    expect(hash).toMatch(/^\$2[aby]?\$/);
  });

  it('should return true for matching password and hash', async () => {
    const password = 'securePassword!';
    const hash = await hashPassword(password);
    const isMatch = await comparePassword(password, hash);
    expect(isMatch).toBe(true);
  });

  it('should return false for non-matching password', async () => {
    const hash = await hashPassword('correctPassword');
    const isMatch = await comparePassword('wrongPassword', hash);
    expect(isMatch).toBe(false);
  });

  it('should generate different hashes for the same password', async () => {
    const password = 'samePassword';
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);
    expect(hash1).not.toBe(hash2);
    // Both should still validate
    expect(await comparePassword(password, hash1)).toBe(true);
    expect(await comparePassword(password, hash2)).toBe(true);
  });
});
