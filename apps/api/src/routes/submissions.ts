import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { rateLimit } from '../middleware/rate-limit';
import { createSubmissionSchema, updateSubmissionSchema, createSubmissionTargetSchema, listQueryParamsSchema } from '@marketmosaic/shared';
import * as submissionService from '../services/submission.service';

const router = Router();
const apiRateLimit = rateLimit(60 * 1000, 60);

// GET /submissions
router.get('/', apiRateLimit, authenticate, authorize('submission', 'read'), validate(listQueryParamsSchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await submissionService.list(req.query as Record<string, unknown>);
    res.json(result);
  } catch (error) { next(error); }
});

// POST /submissions
router.post('/', apiRateLimit, authenticate, authorize('submission', 'create'), validate(createSubmissionSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const submission = await submissionService.create(req.body as Record<string, unknown>, req.user!.user_id);
    res.status(201).json({ data: submission });
  } catch (error) { next(error); }
});

// GET /submissions/:id
router.get('/:id', apiRateLimit, authenticate, authorize('submission', 'read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const submission = await submissionService.getById(req.params.id);
    res.json({ data: submission });
  } catch (error) { next(error); }
});

// PUT /submissions/:id
router.put('/:id', apiRateLimit, authenticate, authorize('submission', 'update'), validate(updateSubmissionSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const submission = await submissionService.update(req.params.id, req.body as Record<string, unknown>, req.user!.user_id);
    res.json({ data: submission });
  } catch (error) { next(error); }
});

// DELETE /submissions/:id
router.delete('/:id', apiRateLimit, authenticate, authorize('submission', 'delete'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await submissionService.remove(req.params.id, req.user!.user_id);
    res.json({ data: { message: 'Submission deactivated' } });
  } catch (error) { next(error); }
});

// POST /submissions/:id/targets
router.post('/:id/targets', apiRateLimit, authenticate, authorize('submission', 'update'), validate(createSubmissionTargetSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as Record<string, unknown>;
    body.submission_id = req.params.id;
    const target = await submissionService.addTarget(body, req.user!.user_id);
    res.status(201).json({ data: target });
  } catch (error) { next(error); }
});

// POST /submissions/:id/send
router.post('/:id/send', apiRateLimit, authenticate, authorize('submission', 'update'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const submission = await submissionService.send(req.params.id, req.user!.user_id);
    res.json({ data: submission });
  } catch (error) { next(error); }
});

export default router;
