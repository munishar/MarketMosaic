import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { rateLimit } from '../middleware/rate-limit';
import { updateSubmissionTargetSchema, listQueryParamsSchema } from '@brokerflow/shared';
import * as placementService from '../services/placement.service';

const router = Router();
const apiRateLimit = rateLimit(60 * 1000, 60);

// GET /placements/kanban
router.get('/kanban', apiRateLimit, authenticate, authorize('submission', 'read'), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await placementService.getKanban();
    res.json({ data: result });
  } catch (error) { next(error); }
});

// GET /placements/timeline
router.get('/timeline', apiRateLimit, authenticate, authorize('submission', 'read'), validate(listQueryParamsSchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await placementService.getTimeline(req.query as Record<string, unknown>);
    res.json(result);
  } catch (error) { next(error); }
});

// PUT /placements/:id/status
router.put('/:id/status', apiRateLimit, authenticate, authorize('submission', 'update'), validate(updateSubmissionTargetSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const placement = await placementService.updateStatus(req.params.id, req.body as Record<string, unknown>, req.user!.user_id);
    res.json({ data: placement });
  } catch (error) { next(error); }
});

export default router;
