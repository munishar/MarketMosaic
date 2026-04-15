import { Router, Request, Response, NextFunction } from 'express';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import { rateLimit } from '../middleware/rate-limit';
import { loginSchema, registerSchema, refreshTokenSchema } from '@brokerflow/shared';
import * as authService from '../services/auth.service';

const router = Router();

// Stricter rate limit for auth endpoints (20 requests per 15 minutes)
const authRateLimit = rateLimit(15 * 60 * 1000, 20);

router.post('/login', authRateLimit, validate(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.login(req.body as { email: string; password: string });
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/register', authRateLimit, validate(registerSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.register(
      req.body as { email: string; password: string; first_name: string; last_name: string; role?: import('@brokerflow/shared').UserRole }
    );
    res.status(201).json({ data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', authRateLimit, validate(refreshTokenSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refresh_token } = req.body as { refresh_token: string };
    const result = await authService.refreshToken(refresh_token);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authRateLimit, authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getCurrentUser(req.user!.user_id);
    res.json({ data: user });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', authRateLimit, authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refresh_token } = req.body as { refresh_token?: string };
    await authService.logout(req.user!.user_id, refresh_token);
    res.json({ data: { message: 'Logged out successfully' } });
  } catch (error) {
    next(error);
  }
});

export default router;
