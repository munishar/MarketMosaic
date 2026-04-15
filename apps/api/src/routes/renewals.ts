import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { rateLimit } from '../middleware/rate-limit';
import { listQueryParamsSchema } from '@brokerflow/shared';
import * as renewalService from '../services/renewal.service';

const router = Router();
const apiRateLimit = rateLimit(60 * 1000, 60);

// GET /renewals
router.get('/', apiRateLimit, authenticate, authorize('submission', 'read'), validate(listQueryParamsSchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await renewalService.list(req.query as Record<string, unknown>);
    res.json(result);
  } catch (error) { next(error); }
});

// GET /renewals/upcoming
router.get('/upcoming', apiRateLimit, authenticate, authorize('submission', 'read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const windowsParam = req.query.windows as string | undefined;
    const windows = windowsParam
      ? windowsParam.split(',').map(Number).filter((n) => !isNaN(n))
      : undefined;
    const result = await renewalService.getUpcoming(windows);
    res.json(result);
  } catch (error) { next(error); }
});

// POST /renewals/:id/initiate
router.post('/:id/initiate', apiRateLimit, authenticate, authorize('submission', 'create'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const submission = await renewalService.initiate(req.params.id, req.user!.user_id);
    res.status(201).json({ data: submission });
  } catch (error) { next(error); }
});

export default router;
