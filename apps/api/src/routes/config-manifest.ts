import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { rateLimit } from '../middleware/rate-limit';
import {
  createManifestSchema,
  updateManifestSchema,
  listQueryParamsSchema,
} from '@marketmosaic/shared';
import * as manifestService from '../services/manifest.service';

const router = Router();
const apiRateLimit = rateLimit(60 * 1000, 60);

// GET /config/manifest
router.get('/', apiRateLimit, authenticate, authorize('manifest', 'read'), validate(listQueryParamsSchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await manifestService.list(req.query as Record<string, unknown>);
    res.json(result);
  } catch (error) { next(error); }
});

// POST /config/manifest
router.post('/', apiRateLimit, authenticate, authorize('manifest', 'create'), validate(createManifestSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const manifest = await manifestService.create(req.body as Record<string, unknown>, req.user!.user_id);
    res.status(201).json({ data: manifest });
  } catch (error) { next(error); }
});

// GET /config/manifest/:id
router.get('/:id', apiRateLimit, authenticate, authorize('manifest', 'read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const manifest = await manifestService.getById(req.params.id);
    res.json({ data: manifest });
  } catch (error) { next(error); }
});

// PUT /config/manifest/:id
router.put('/:id', apiRateLimit, authenticate, authorize('manifest', 'update'), validate(updateManifestSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const manifest = await manifestService.update(req.params.id, req.body as Record<string, unknown>, req.user!.user_id);
    res.json({ data: manifest });
  } catch (error) { next(error); }
});

// DELETE /config/manifest/:id
router.delete('/:id', apiRateLimit, authenticate, authorize('manifest', 'delete'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await manifestService.remove(req.params.id);
    res.json({ data: { message: 'Manifest deactivated' } });
  } catch (error) { next(error); }
});

// POST /config/manifest/:id/rollback
router.post('/:id/rollback', apiRateLimit, authenticate, authorize('manifest', 'update'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const manifest = await manifestService.rollback(req.params.id);
    res.json({ data: manifest });
  } catch (error) { next(error); }
});

export default router;
