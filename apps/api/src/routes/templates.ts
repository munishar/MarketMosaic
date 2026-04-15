import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { rateLimit } from '../middleware/rate-limit';
import { createTemplateSchema, updateTemplateSchema, listQueryParamsSchema } from '@brokerflow/shared';
import * as templateService from '../services/template.service';
import { z } from 'zod';

const router = Router();
const apiRateLimit = rateLimit(60 * 1000, 60);

const renderSchema = z.object({
  context: z.record(z.string(), z.record(z.string(), z.unknown())),
  on_missing: z.enum(['leave', 'empty']).optional(),
});

// GET /templates
router.get(
  '/',
  apiRateLimit,
  authenticate,
  authorize('template', 'read'),
  validate(listQueryParamsSchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await templateService.list(req.query as Record<string, unknown>);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

// POST /templates
router.post(
  '/',
  apiRateLimit,
  authenticate,
  authorize('template', 'create'),
  validate(createTemplateSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const template = await templateService.create(req.body as Record<string, unknown>, req.user!.user_id);
      res.status(201).json({ data: template });
    } catch (error) {
      next(error);
    }
  },
);

// GET /templates/:id
router.get(
  '/:id',
  apiRateLimit,
  authenticate,
  authorize('template', 'read'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const template = await templateService.getById(req.params.id);
      res.json({ data: template });
    } catch (error) {
      next(error);
    }
  },
);

// PUT /templates/:id
router.put(
  '/:id',
  apiRateLimit,
  authenticate,
  authorize('template', 'update'),
  validate(updateTemplateSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const template = await templateService.update(req.params.id, req.body as Record<string, unknown>);
      res.json({ data: template });
    } catch (error) {
      next(error);
    }
  },
);

// POST /templates/:id/render
router.post(
  '/:id/render',
  apiRateLimit,
  authenticate,
  authorize('template', 'read'),
  validate(renderSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await templateService.render(
        req.params.id,
        req.body as { context: Record<string, Record<string, unknown>>; on_missing?: 'leave' | 'empty' },
      );
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  },
);

// DELETE /templates/:id
router.delete(
  '/:id',
  apiRateLimit,
  authenticate,
  authorize('template', 'delete'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await templateService.remove(req.params.id);
      res.json({ data: { message: 'Template deleted' } });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
