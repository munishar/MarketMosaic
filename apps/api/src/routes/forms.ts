import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { rateLimit } from '../middleware/rate-limit';
import { createFormPaperSchema, updateFormPaperSchema, listQueryParamsSchema } from '@brokerflow/shared';
import * as formService from '../services/form.service';

const router = Router();
const apiRateLimit = rateLimit(60 * 1000, 60);

// GET /forms — List all forms/papers
router.get('/', apiRateLimit, authenticate, authorize('form_paper', 'read'), validate(listQueryParamsSchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = req.query as Record<string, unknown>;
    const result = await formService.list(params);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /forms — Create a form/paper
router.post('/', apiRateLimit, authenticate, authorize('form_paper', 'create'), validate(createFormPaperSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const form = await formService.create(req.body as Record<string, unknown>, req.user!.user_id);
    res.status(201).json({ data: form });
  } catch (error) {
    next(error);
  }
});

// GET /forms/:id — Get form by ID
router.get('/:id', apiRateLimit, authenticate, authorize('form_paper', 'read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const form = await formService.getById(req.params.id);
    res.json({ data: form });
  } catch (error) {
    next(error);
  }
});

// PUT /forms/:id — Update a form/paper
router.put('/:id', apiRateLimit, authenticate, authorize('form_paper', 'update'), validate(updateFormPaperSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const form = await formService.update(req.params.id, req.body as Record<string, unknown>, req.user!.user_id);
    res.json({ data: form });
  } catch (error) {
    next(error);
  }
});

// DELETE /forms/:id — Delete (deactivate) a form/paper
router.delete('/:id', apiRateLimit, authenticate, authorize('form_paper', 'delete'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await formService.remove(req.params.id, req.user!.user_id);
    res.json({ data: { message: 'Form/paper deleted' } });
  } catch (error) {
    next(error);
  }
});

export default router;
