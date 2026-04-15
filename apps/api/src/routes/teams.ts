import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { rateLimit } from '../middleware/rate-limit';
import { createTeamSchema, updateTeamSchema, listQueryParamsSchema } from '@brokerflow/shared';
import * as teamService from '../services/team.service';

const router = Router();
const apiRateLimit = rateLimit(60 * 1000, 60);

// GET /teams
router.get('/', apiRateLimit, authenticate, authorize('team', 'read'), validate(listQueryParamsSchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await teamService.list(req.query as Record<string, unknown>);
    res.json(result);
  } catch (error) { next(error); }
});

// POST /teams
router.post('/', apiRateLimit, authenticate, authorize('team', 'create'), validate(createTeamSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const team = await teamService.create(req.body as Record<string, unknown>, req.user!.user_id);
    res.status(201).json({ data: team });
  } catch (error) { next(error); }
});

// GET /teams/:id
router.get('/:id', apiRateLimit, authenticate, authorize('team', 'read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const team = await teamService.getById(req.params.id);
    res.json({ data: team });
  } catch (error) { next(error); }
});

// PUT /teams/:id
router.put('/:id', apiRateLimit, authenticate, authorize('team', 'update'), validate(updateTeamSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const team = await teamService.update(req.params.id, req.body as Record<string, unknown>, req.user!.user_id);
    res.json({ data: team });
  } catch (error) { next(error); }
});

// DELETE /teams/:id
router.delete('/:id', apiRateLimit, authenticate, authorize('team', 'delete'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await teamService.remove(req.params.id);
    res.json({ data: { message: 'Team deleted' } });
  } catch (error) { next(error); }
});

// GET /teams/:id/members
router.get('/:id/members', apiRateLimit, authenticate, authorize('team', 'read'), validate(listQueryParamsSchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await teamService.getMembers(req.params.id, req.query as Record<string, unknown>);
    res.json(result);
  } catch (error) { next(error); }
});

export default router;
