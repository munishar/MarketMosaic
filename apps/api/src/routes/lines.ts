import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { rateLimit } from '../middleware/rate-limit';
import { createLineOfBusinessSchema, updateLineOfBusinessSchema, listQueryParamsSchema } from '@marketmosaic/shared';
import * as lineService from '../services/line.service';

const router = Router();
const apiRateLimit = rateLimit(60 * 1000, 60);

// GET /lines — List all lines of business (flat list with parent_line_id for tree building)
router.get('/', apiRateLimit, authenticate, authorize('line_of_business', 'read'), validate(listQueryParamsSchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await lineService.list(req.query as Record<string, unknown>);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /lines — Create a line of business
router.post('/', apiRateLimit, authenticate, authorize('line_of_business', 'create'), validate(createLineOfBusinessSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const line = await lineService.create(req.body as Record<string, unknown>, req.user!.user_id);
    res.status(201).json({ data: line });
  } catch (error) {
    next(error);
  }
});

// GET /lines/:id — Get line of business by ID
router.get('/:id', apiRateLimit, authenticate, authorize('line_of_business', 'read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const line = await lineService.getById(req.params.id);
    res.json({ data: line });
  } catch (error) {
    next(error);
  }
});

// PUT /lines/:id — Update a line of business
router.put('/:id', apiRateLimit, authenticate, authorize('line_of_business', 'update'), validate(updateLineOfBusinessSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const line = await lineService.update(req.params.id, req.body as Record<string, unknown>, req.user!.user_id);
    res.json({ data: line });
  } catch (error) {
    next(error);
  }
});

// DELETE /lines/:id — Delete (deactivate) a line of business
router.delete('/:id', apiRateLimit, authenticate, authorize('line_of_business', 'delete'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await lineService.remove(req.params.id, req.user!.user_id);
    res.json({ data: { message: 'Line of business deleted' } });
  } catch (error) {
    next(error);
  }
});

// GET /lines/:id/children — Get child lines of business
router.get('/:id/children', apiRateLimit, authenticate, authorize('line_of_business', 'read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const children = await lineService.getChildren(req.params.id);
    res.json({ data: children });
  } catch (error) {
    next(error);
  }
});

export default router;
