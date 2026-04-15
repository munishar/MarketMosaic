import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { rateLimit } from '../middleware/rate-limit';
import { createClientSchema, updateClientSchema, listQueryParamsSchema } from '@brokerflow/shared';
import * as clientService from '../services/client.service';

const router = Router();
const apiRateLimit = rateLimit(60 * 1000, 60);

// GET /clients
router.get('/', apiRateLimit, authenticate, authorize('client', 'read'), validate(listQueryParamsSchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await clientService.list(req.query as Record<string, unknown>);
    res.json(result);
  } catch (error) { next(error); }
});

// POST /clients
router.post('/', apiRateLimit, authenticate, authorize('client', 'create'), validate(createClientSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const client = await clientService.create(req.body as Record<string, unknown>, req.user!.user_id);
    res.status(201).json({ data: client });
  } catch (error) { next(error); }
});

// GET /clients/:id
router.get('/:id', apiRateLimit, authenticate, authorize('client', 'read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const client = await clientService.getById(req.params.id);
    res.json({ data: client });
  } catch (error) { next(error); }
});

// PUT /clients/:id
router.put('/:id', apiRateLimit, authenticate, authorize('client', 'update'), validate(updateClientSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const client = await clientService.update(req.params.id, req.body as Record<string, unknown>, req.user!.user_id);
    res.json({ data: client });
  } catch (error) { next(error); }
});

// DELETE /clients/:id
router.delete('/:id', apiRateLimit, authenticate, authorize('client', 'delete'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await clientService.remove(req.params.id, req.user!.user_id);
    res.json({ data: { message: 'Client deactivated' } });
  } catch (error) { next(error); }
});

// GET /clients/:id/submissions
router.get('/:id/submissions', apiRateLimit, authenticate, authorize('client', 'read'), validate(listQueryParamsSchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await clientService.getSubmissions(req.params.id, req.query as Record<string, unknown>);
    res.json(result);
  } catch (error) { next(error); }
});

// GET /clients/:id/activities
router.get('/:id/activities', apiRateLimit, authenticate, authorize('client', 'read'), validate(listQueryParamsSchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await clientService.getActivities(req.params.id, req.query as Record<string, unknown>);
    res.json(result);
  } catch (error) { next(error); }
});

// GET /clients/:id/attachments
router.get('/:id/attachments', apiRateLimit, authenticate, authorize('client', 'read'), validate(listQueryParamsSchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await clientService.getAttachments(req.params.id, req.query as Record<string, unknown>);
    res.json(result);
  } catch (error) { next(error); }
});

export default router;
