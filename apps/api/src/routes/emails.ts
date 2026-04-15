import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { rateLimit } from '../middleware/rate-limit';
import { sendEmailSchema, listQueryParamsSchema } from '@marketmosaic/shared';
import * as emailService from '../services/email.service';
import * as emailParserService from '../services/email-parser.service';

const router = Router();
const apiRateLimit = rateLimit(60 * 1000, 60);

// GET /emails/inbox - inbox list
router.get('/inbox', apiRateLimit, authenticate, authorize('email', 'read'), validate(listQueryParamsSchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await emailService.listInbox(req.query as Record<string, unknown>);
    res.json(result);
  } catch (error) { next(error); }
});

// GET /emails/parse-queue - list emails needing parse
router.get('/parse-queue', apiRateLimit, authenticate, authorize('email', 'read'), validate(listQueryParamsSchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await emailService.listParseQueue(req.query as Record<string, unknown>);
    res.json(result);
  } catch (error) { next(error); }
});

// GET /emails/thread/:id - thread view
router.get('/thread/:id', apiRateLimit, authenticate, authorize('email', 'read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const emails = await emailService.getThread(req.params.id);
    res.json({ data: emails });
  } catch (error) { next(error); }
});

// GET /emails/:id - single email
router.get('/:id', apiRateLimit, authenticate, authorize('email', 'read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = await emailService.getById(req.params.id);
    res.json({ data: email });
  } catch (error) { next(error); }
});

// POST /emails/send - send email
router.post('/send', apiRateLimit, authenticate, authorize('email', 'create'), validate(sendEmailSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = await emailService.sendEmail(req.body as Record<string, unknown>, req.user!.user_id);
    res.status(201).json({ data: email });
  } catch (error) { next(error); }
});

// POST /emails/draft - save draft
router.post('/draft', apiRateLimit, authenticate, authorize('email', 'create'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = await emailService.saveDraft(req.body as Record<string, unknown>, req.user!.user_id);
    res.status(201).json({ data: email });
  } catch (error) { next(error); }
});

// POST /emails/:id/parse - trigger AI parse
router.post('/:id/parse', apiRateLimit, authenticate, authorize('email', 'update'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = await emailParserService.triggerParse(req.params.id);
    res.json({ data: email });
  } catch (error) { next(error); }
});

// POST /emails/:id/confirm-parse - confirm parsed data
router.post('/:id/confirm-parse', apiRateLimit, authenticate, authorize('email', 'update'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = await emailParserService.confirmParse(req.params.id, req.body as Record<string, unknown>);
    res.json({ data: email });
  } catch (error) { next(error); }
});

export default router;
