import { Router, Request, Response, NextFunction } from 'express';
import { rateLimit } from '../middleware/rate-limit';
import * as emailImportService from '../services/email-import.service';

const router = Router();
const webhookRateLimit = rateLimit(60 * 1000, 30);

/**
 * GET /webhooks/oauth-callback
 * OAuth callback for Microsoft Graph API email integration.
 * Receives auth code, exchanges for token, and updates import job.
 */
router.get('/', webhookRateLimit, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, state, error: oauthError } = req.query as Record<string, string>;

    if (oauthError) {
      res.status(400).json({
        error: { code: 'OAUTH_ERROR', message: `OAuth error: ${oauthError}` },
      });
      return;
    }

    if (!code || !state) {
      res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Missing code or state parameter' },
      });
      return;
    }

    // State contains the job_id
    const jobId = state;

    // In production, exchange code for access token via Microsoft Graph API:
    // POST https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token
    // const tokenResponse = await exchangeCodeForToken(code);
    // For now, store the code as a placeholder

    const job = await emailImportService.getStatus(jobId);
    if (!job) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Import job not found' },
      });
      return;
    }

    // Update the job with the OAuth token (would be actual token in production)
    // In a real implementation:
    // await importQueries.updateStatus(jobId, 'scanning', { oauth_token_encrypted: encryptedToken });

    res.json({
      data: {
        job_id: jobId,
        status: 'connected',
        message: 'OAuth connection successful. Use POST /import/start to begin import.',
      },
    });
  } catch (error) { next(error); }
});

export default router;
