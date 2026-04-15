import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { rateLimit } from '../middleware/rate-limit';
import { createCapacitySchema, updateCapacitySchema, listQueryParamsSchema } from '@marketmosaic/shared';
import * as capacityService from '../services/capacity.service';

const router = Router();
const apiRateLimit = rateLimit(60 * 1000, 60);

// GET /capacity/search — Power search endpoint with advanced filters
router.get('/search', apiRateLimit, authenticate, authorize('capacity', 'read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { line_id, carrier_id, min_limit, state, industry_class, has_available_capacity, page, limit } = req.query as Record<string, string | undefined>;
    const result = await capacityService.search({
      line_id,
      carrier_id,
      min_limit,
      state,
      industry_class,
      has_available_capacity: has_available_capacity === 'true',
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /capacity — List all capacity records
router.get('/', apiRateLimit, authenticate, authorize('capacity', 'read'), validate(listQueryParamsSchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = req.query as Record<string, unknown>;
    const result = await capacityService.list(params);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /capacity — Create a capacity record
router.post('/', apiRateLimit, authenticate, authorize('capacity', 'create'), validate(createCapacitySchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const capacity = await capacityService.create(req.body as Record<string, unknown>, req.user!.user_id);
    res.status(201).json({ data: capacity });
  } catch (error) {
    next(error);
  }
});

// GET /capacity/:id — Get capacity by ID
router.get('/:id', apiRateLimit, authenticate, authorize('capacity', 'read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const capacity = await capacityService.getById(req.params.id);
    res.json({ data: capacity });
  } catch (error) {
    next(error);
  }
});

// PUT /capacity/:id — Update a capacity record
router.put('/:id', apiRateLimit, authenticate, authorize('capacity', 'update'), validate(updateCapacitySchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const capacity = await capacityService.update(req.params.id, req.body as Record<string, unknown>, req.user!.user_id);
    res.json({ data: capacity });
  } catch (error) {
    next(error);
  }
});

// DELETE /capacity/:id — Delete (deactivate) a capacity record
router.delete('/:id', apiRateLimit, authenticate, authorize('capacity', 'delete'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await capacityService.remove(req.params.id, req.user!.user_id);
    res.json({ data: { message: 'Capacity record deleted' } });
  } catch (error) {
    next(error);
  }
});

export default router;
