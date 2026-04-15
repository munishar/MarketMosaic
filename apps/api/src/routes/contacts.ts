import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { rateLimit } from '../middleware/rate-limit';
import { createContactSchema, updateContactSchema, listQueryParamsSchema } from '@brokerflow/shared';
import * as contactService from '../services/contact.service';

const router = Router();
const apiRateLimit = rateLimit(60 * 1000, 60);

// GET /contacts
router.get('/', apiRateLimit, authenticate, authorize('contact', 'read'), validate(listQueryParamsSchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await contactService.list(req.query as Record<string, unknown>);
    res.json(result);
  } catch (error) { next(error); }
});

// POST /contacts
router.post('/', apiRateLimit, authenticate, authorize('contact', 'create'), validate(createContactSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contact = await contactService.create(req.body as Record<string, unknown>, req.user!.user_id);
    res.status(201).json({ data: contact });
  } catch (error) { next(error); }
});

// GET /contacts/:id
router.get('/:id', apiRateLimit, authenticate, authorize('contact', 'read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contact = await contactService.getById(req.params.id);
    res.json({ data: contact });
  } catch (error) { next(error); }
});

// PUT /contacts/:id
router.put('/:id', apiRateLimit, authenticate, authorize('contact', 'update'), validate(updateContactSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contact = await contactService.update(req.params.id, req.body as Record<string, unknown>, req.user!.user_id);
    res.json({ data: contact });
  } catch (error) { next(error); }
});

// DELETE /contacts/:id
router.delete('/:id', apiRateLimit, authenticate, authorize('contact', 'delete'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await contactService.remove(req.params.id, req.user!.user_id);
    res.json({ data: { message: 'Contact deactivated' } });
  } catch (error) { next(error); }
});

// GET /contacts/:id/capacity — Capacity records with carrier + LOB joined
router.get('/:id/capacity', apiRateLimit, authenticate, authorize('contact', 'read'), validate(listQueryParamsSchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await contactService.getCapacity(req.params.id, req.query as Record<string, unknown>);
    res.json(result);
  } catch (error) { next(error); }
});

// GET /contacts/:id/network — NetworkRelationship records with user data joined
router.get('/:id/network', apiRateLimit, authenticate, authorize('contact', 'read'), validate(listQueryParamsSchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await contactService.getNetwork(req.params.id, req.query as Record<string, unknown>);
    res.json(result);
  } catch (error) { next(error); }
});

export default router;
