import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { rateLimit } from '../middleware/rate-limit';
import {
  createSyncScheduleSchema,
  updateSyncScheduleSchema,
  createSyncJobSchema,
  createAMSConnectionSchema,
  updateAMSConnectionSchema,
  listQueryParamsSchema,
} from '@brokerflow/shared';
import * as syncService from '../services/sync.service';
import * as freshnessService from '../services/freshness.service';

const router = Router();
const apiRateLimit = rateLimit(60 * 1000, 60);

// ─── Schedules ───────────────────────────────────────

// GET /sync/schedules
router.get('/schedules', apiRateLimit, authenticate, authorize('sync', 'read'), validate(listQueryParamsSchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await syncService.listSchedules(req.query as Record<string, unknown>);
    res.json(result);
  } catch (error) { next(error); }
});

// POST /sync/schedules
router.post('/schedules', apiRateLimit, authenticate, authorize('sync', 'create'), validate(createSyncScheduleSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schedule = await syncService.createSchedule(req.body as Record<string, unknown>, req.user!.user_id);
    res.status(201).json({ data: schedule });
  } catch (error) { next(error); }
});

// PUT /sync/schedules/:id
router.put('/schedules/:id', apiRateLimit, authenticate, authorize('sync', 'update'), validate(updateSyncScheduleSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schedule = await syncService.updateSchedule(req.params.id, req.body as Record<string, unknown>, req.user!.user_id);
    res.json({ data: schedule });
  } catch (error) { next(error); }
});

// DELETE /sync/schedules/:id
router.delete('/schedules/:id', apiRateLimit, authenticate, authorize('sync', 'delete'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await syncService.deactivateSchedule(req.params.id);
    res.json({ data: { message: 'Sync schedule deactivated' } });
  } catch (error) { next(error); }
});

// POST /sync/schedules/:id/trigger
router.post('/schedules/:id/trigger', apiRateLimit, authenticate, authorize('sync', 'update'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await syncService.triggerSchedule(req.params.id, req.user!.user_id);
    res.status(201).json({ data: job });
  } catch (error) { next(error); }
});

// ─── Jobs ────────────────────────────────────────────

// GET /sync/jobs
router.get('/jobs', apiRateLimit, authenticate, authorize('sync', 'read'), validate(listQueryParamsSchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await syncService.listJobs(req.query as Record<string, unknown>);
    res.json(result);
  } catch (error) { next(error); }
});

// GET /sync/jobs/:id
router.get('/jobs/:id', apiRateLimit, authenticate, authorize('sync', 'read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await syncService.getJobById(req.params.id);
    res.json({ data: job });
  } catch (error) { next(error); }
});

// POST /sync/jobs/:id/cancel
router.post('/jobs/:id/cancel', apiRateLimit, authenticate, authorize('sync', 'update'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await syncService.cancelJob(req.params.id);
    res.json({ data: job });
  } catch (error) { next(error); }
});

// ─── AMS Connections ─────────────────────────────────

// GET /sync/connections
router.get('/connections', apiRateLimit, authenticate, authorize('sync', 'read'), validate(listQueryParamsSchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await syncService.listConnections(req.query as Record<string, unknown>);
    res.json(result);
  } catch (error) { next(error); }
});

// POST /sync/connections
router.post('/connections', apiRateLimit, authenticate, authorize('sync', 'create'), validate(createAMSConnectionSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const connection = await syncService.createConnection(req.body as Record<string, unknown>, req.user!.user_id);
    res.status(201).json({ data: connection });
  } catch (error) { next(error); }
});

// PUT /sync/connections/:id
router.put('/connections/:id', apiRateLimit, authenticate, authorize('sync', 'update'), validate(updateAMSConnectionSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const connection = await syncService.updateConnection(req.params.id, req.body as Record<string, unknown>, req.user!.user_id);
    res.json({ data: connection });
  } catch (error) { next(error); }
});

// POST /sync/connections/:id/test
router.post('/connections/:id/test', apiRateLimit, authenticate, authorize('sync', 'update'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await syncService.testConnection(req.params.id);
    res.json({ data: result });
  } catch (error) { next(error); }
});

// DELETE /sync/connections/:id
router.delete('/connections/:id', apiRateLimit, authenticate, authorize('sync', 'delete'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await syncService.deactivateConnection(req.params.id);
    res.json({ data: { message: 'AMS connection deactivated' } });
  } catch (error) { next(error); }
});

// ─── Freshness ───────────────────────────────────────

// GET /sync/freshness
router.get('/freshness', apiRateLimit, authenticate, authorize('sync', 'read'), validate(listQueryParamsSchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await freshnessService.list(req.query as Record<string, unknown>);
    res.json(result);
  } catch (error) { next(error); }
});

// POST /sync/freshness/refresh/:entityType/:entityId
router.post('/freshness/refresh/:entityType/:entityId', apiRateLimit, authenticate, authorize('sync', 'update'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const record = await freshnessService.refreshEntity(
      req.params.entityType,
      req.params.entityId,
      req.user!.user_id,
    );
    res.json({ data: record });
  } catch (error) { next(error); }
});

export default router;
