import { Router, Request, Response, NextFunction } from 'express';
import { rateLimit } from '../middleware/rate-limit';
import * as emailService from '../services/email.service';

const router = Router();
const webhookRateLimit = rateLimit(60 * 1000, 120);

/**
 * POST /webhooks/inbound-email
 * Receive inbound email via webhook from email provider (e.g., Azure Communication Services).
 * Saves to DB, auto-links sender to Contact, auto-links to Submission, queues for AI parsing.
 */
router.post('/', webhookRateLimit, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as Record<string, unknown>;

    // Validate minimum required fields
    if (!body.from_address || !body.subject) {
      res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'from_address and subject are required' },
      });
      return;
    }

    const email = await emailService.receiveEmail({
      from_address: body.from_address,
      to_addresses: body.to_addresses ?? [],
      cc_addresses: body.cc_addresses ?? [],
      subject: body.subject,
      body_text: body.body_text ?? '',
      body_html: body.body_html ?? null,
      sent_at: body.sent_at ?? new Date().toISOString(),
      thread_id: body.thread_id ?? null,
      external_message_id: body.external_message_id ?? null,
      attachments: body.attachments ?? [],
      source: body.source ?? 'platform',
    });

    res.status(201).json({ data: { email_id: email.id, status: 'received' } });
  } catch (error) { next(error); }
});

export default router;
