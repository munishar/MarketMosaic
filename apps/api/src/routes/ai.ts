import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate';
import { rateLimit } from '../middleware/rate-limit';
import * as aiService from '../services/ai.service';

const router = Router();
const aiRateLimit = rateLimit(60 * 1000, 30); // More restrictive for AI

// POST /ai/chat — Send message to AI assistant
router.post('/chat', aiRateLimit, authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, page_context } = req.body as { message: string; page_context?: Record<string, string> };
    
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'message is required and must be a non-empty string' } });
      return;
    }

    const result = await aiService.chat({
      message: message.trim(),
      user: req.user! as unknown as Record<string, unknown>,
      pageContext: page_context,
    });

    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

// GET /ai/history — Get chat history
router.get('/history', aiRateLimit, authenticate, async (req: Request, res: Response, _next: NextFunction) => {
  const history = aiService.getHistory(req.user!.user_id);
  res.json({ data: history });
});

// POST /ai/execute-action — Execute a confirmed action
router.post('/execute-action', aiRateLimit, authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tool_name, parameters } = req.body as { tool_name: string; parameters: Record<string, unknown> };
    
    if (!tool_name) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'tool_name is required' } });
      return;
    }

    const result = await aiService.executeAction({
      tool_name,
      parameters: parameters ?? {},
      user: req.user! as unknown as Record<string, unknown>,
    });

    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

// DELETE /ai/history — Clear chat history
router.delete('/history', authenticate, async (req: Request, res: Response) => {
  aiService.clearHistory(req.user!.user_id);
  res.json({ data: { message: 'Chat history cleared' } });
});

export default router;
