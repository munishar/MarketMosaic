import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { rateLimit } from '../middleware/rate-limit';
import * as matcherService from '../services/matcher.service';

const router = Router();
const apiRateLimit = rateLimit(60 * 1000, 60);

// POST /match/underwriters — Run underwriter matching
router.post('/underwriters', apiRateLimit, authenticate, authorize('capacity', 'read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { client_id, line_of_business_id, requested_limit } = req.body as { client_id: string; line_of_business_id: string; requested_limit: number };
    
    if (!client_id || !line_of_business_id || requested_limit === undefined) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'client_id, line_of_business_id, and requested_limit are required' } });
      return;
    }

    const result = await matcherService.matchUnderwriters(
      { client_id, line_of_business_id, requested_limit },
      req.user!.user_id,
      req.user!.team_id ?? null,
    );
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

// GET /match/explain/:matchId — Get match explanation
router.get('/explain/:matchId', apiRateLimit, authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = matcherService.getMatchExplanation(req.params.matchId);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

export default router;
