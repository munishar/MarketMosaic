import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { rateLimit } from '../middleware/rate-limit';
import * as networkService from '../services/network.service';

const router = Router();
const apiRateLimit = rateLimit(60 * 1000, 60);

// GET /network — Get network graph data
router.get('/', apiRateLimit, authenticate, authorize('contact', 'read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { carrier_id, region } = req.query as Record<string, string | undefined>;
    const graph = await networkService.getGraph(req.user!.user_id, { carrier_id, region });
    res.json({ data: graph });
  } catch (error) {
    next(error);
  }
});

// GET /network/search — Search contacts in network
router.get('/search', apiRateLimit, authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, from, to } = req.query as Record<string, string | undefined>;
    
    if (from && to) {
      // Find path between users
      const result = await networkService.findPath(from, to);
      res.json({ data: result });
      return;
    }

    if (q) {
      const contacts = await networkService.searchContacts(q);
      res.json({ data: contacts });
      return;
    }

    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Provide q (search term) or from/to (path finding)' } });
  } catch (error) {
    next(error);
  }
});

// POST /network/relationships — Create relationship
router.post('/relationships', apiRateLimit, authenticate, authorize('contact', 'create'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const relationship = await networkService.createRelationship(req.body as Record<string, unknown>, req.user!.user_id);
    res.status(201).json({ data: relationship });
  } catch (error) {
    next(error);
  }
});

// PUT /network/relationships/:id — Update relationship
router.put('/relationships/:id', apiRateLimit, authenticate, authorize('contact', 'update'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const relationship = await networkService.updateRelationship(req.params.id, req.body as Record<string, unknown>, req.user!.user_id);
    res.json({ data: relationship });
  } catch (error) {
    next(error);
  }
});

// POST /network/introductions — Request introduction
router.post('/introductions', apiRateLimit, authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { colleague_id, contact_id, message } = req.body as { colleague_id: string; contact_id: string; message?: string };
    
    if (!colleague_id || !contact_id) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'colleague_id and contact_id are required' } });
      return;
    }

    const result = await networkService.requestIntroduction({
      requester_id: req.user!.user_id,
      colleague_id,
      contact_id,
      message,
    });
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

export default router;
