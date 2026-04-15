import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { rateLimit } from '../middleware/rate-limit';
import { createUserSchema, updateUserSchema, listQueryParamsSchema } from '@brokerflow/shared';
import * as userService from '../services/user.service';

const router = Router();
const apiRateLimit = rateLimit(60 * 1000, 60);

// GET /users
router.get('/', apiRateLimit, authenticate, authorize('user', 'read'), validate(listQueryParamsSchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await userService.list(req.query as Record<string, unknown>);
    res.json(result);
  } catch (error) { next(error); }
});

// POST /users
router.post('/', apiRateLimit, authenticate, authorize('user', 'create'), validate(createUserSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.create(req.body as Record<string, unknown>, req.user!.user_id);
    res.status(201).json({ data: user });
  } catch (error) { next(error); }
});

// GET /users/:id
router.get('/:id', apiRateLimit, authenticate, authorize('user', 'read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.getById(req.params.id);
    res.json({ data: user });
  } catch (error) { next(error); }
});

// PUT /users/:id
router.put('/:id', apiRateLimit, authenticate, authorize('user', 'update'), validate(updateUserSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.update(req.params.id, req.body as Record<string, unknown>, req.user!.user_id);
    res.json({ data: user });
  } catch (error) { next(error); }
});

// DELETE /users/:id
router.delete('/:id', apiRateLimit, authenticate, authorize('user', 'delete'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await userService.remove(req.params.id, req.user!.user_id);
    res.json({ data: { message: 'User deactivated' } });
  } catch (error) { next(error); }
});

export default router;
