import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { rateLimit } from '../middleware/rate-limit';
import { startEmailImportSchema, listQueryParamsSchema } from '@brokerflow/shared';
import * as emailImportService from '../services/email-import.service';

const router = Router();
const apiRateLimit = rateLimit(60 * 1000, 60);

// POST /import/connect - OAuth connect
router.post('/connect', apiRateLimit, authenticate, authorize('email', 'create'), validate(startEmailImportSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await emailImportService.connectProvider(req.body as Record<string, unknown>, req.user!.user_id);
    res.status(201).json({ data: job });
  } catch (error) { next(error); }
});

// GET /import/preview - preview matched emails
router.get('/preview', apiRateLimit, authenticate, authorize('email', 'read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobId = req.query.job_id as string;
    if (!jobId) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'job_id query parameter is required' } });
      return;
    }
    const preview = await emailImportService.previewImport(jobId);
    res.json({ data: preview });
  } catch (error) { next(error); }
});

// POST /import/start - begin import
router.post('/start', apiRateLimit, authenticate, authorize('email', 'create'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobId = (req.body as Record<string, unknown>).job_id as string;
    if (!jobId) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'job_id is required' } });
      return;
    }
    const job = await emailImportService.startImport(jobId);
    res.json({ data: job });
  } catch (error) { next(error); }
});

// GET /import/status - check import status
router.get('/status', apiRateLimit, authenticate, authorize('email', 'read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobId = req.query.job_id as string;
    if (!jobId) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'job_id query parameter is required' } });
      return;
    }
    const job = await emailImportService.getStatus(jobId);
    res.json({ data: job });
  } catch (error) { next(error); }
});

// POST /import/cancel - cancel import
router.post('/cancel', apiRateLimit, authenticate, authorize('email', 'update'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobId = (req.body as Record<string, unknown>).job_id as string;
    if (!jobId) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'job_id is required' } });
      return;
    }
    const job = await emailImportService.cancelImport(jobId);
    res.json({ data: job });
  } catch (error) { next(error); }
});

// GET /import/report - import report
router.get('/report', apiRateLimit, authenticate, authorize('email', 'read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobId = req.query.job_id as string;
    if (!jobId) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'job_id query parameter is required' } });
      return;
    }
    const report = await emailImportService.getReport(jobId);
    res.json({ data: report });
  } catch (error) { next(error); }
});

// DELETE /import/purge - purge imported data
router.delete('/purge', apiRateLimit, authenticate, authorize('email', 'delete'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobId = req.query.job_id as string;
    if (!jobId) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'job_id query parameter is required' } });
      return;
    }
    const result = await emailImportService.purgeImportedData(jobId);
    res.json({ data: result });
  } catch (error) { next(error); }
});

// PUT /import/settings - update import settings
router.put('/settings', apiRateLimit, authenticate, authorize('email', 'update'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobId = (req.body as Record<string, unknown>).job_id as string;
    if (!jobId) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'job_id is required in request body' } });
      return;
    }
    const job = await emailImportService.updateSettings(jobId, req.body as Record<string, unknown>);
    res.json({ data: job });
  } catch (error) { next(error); }
});

// GET /import/jobs - list import jobs
router.get('/jobs', apiRateLimit, authenticate, authorize('email', 'read'), validate(listQueryParamsSchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await emailImportService.listJobs(req.query as Record<string, unknown>);
    res.json(result);
  } catch (error) { next(error); }
});

export default router;
