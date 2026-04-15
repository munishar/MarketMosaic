import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { rateLimit } from '../middleware/rate-limit';
import { createCarrierSchema, updateCarrierSchema, listQueryParamsSchema } from '@marketmosaic/shared';
import * as carrierService from '../services/carrier.service';

const router = Router();
const apiRateLimit = rateLimit(60 * 1000, 60);

// GET /carriers — List all carriers
router.get('/', apiRateLimit, authenticate, authorize('carrier', 'read'), validate(listQueryParamsSchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await carrierService.list(req.query as Record<string, unknown>);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /carriers — Create a carrier
router.post('/', apiRateLimit, authenticate, authorize('carrier', 'create'), validate(createCarrierSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const carrier = await carrierService.create(req.body as Record<string, unknown>, req.user!.user_id);
    res.status(201).json({ data: carrier });
  } catch (error) {
    next(error);
  }
});

// GET /carriers/:id — Get carrier by ID
router.get('/:id', apiRateLimit, authenticate, authorize('carrier', 'read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const carrier = await carrierService.getById(req.params.id);
    res.json({ data: carrier });
  } catch (error) {
    next(error);
  }
});

// PUT /carriers/:id — Update a carrier
router.put('/:id', apiRateLimit, authenticate, authorize('carrier', 'update'), validate(updateCarrierSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const carrier = await carrierService.update(req.params.id, req.body as Record<string, unknown>, req.user!.user_id);
    res.json({ data: carrier });
  } catch (error) {
    next(error);
  }
});

// GET /carriers/:id/contacts — Get contacts for a carrier
router.get('/:id/contacts', apiRateLimit, authenticate, authorize('carrier', 'read'), validate(listQueryParamsSchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await carrierService.getContacts(req.params.id, req.query as Record<string, unknown>);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /carriers/:id/forms — Get forms for a carrier
router.get('/:id/forms', apiRateLimit, authenticate, authorize('carrier', 'read'), validate(listQueryParamsSchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await carrierService.getForms(req.params.id, req.query as Record<string, unknown>);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /carriers/:id/lines — Get lines of business for a carrier
router.get('/:id/lines', apiRateLimit, authenticate, authorize('carrier', 'read'), validate(listQueryParamsSchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await carrierService.getLines(req.params.id, req.query as Record<string, unknown>);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
