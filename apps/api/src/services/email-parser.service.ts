import * as emailQueries from '../queries/email.queries';
import { AppError } from '../middleware/error-handler';
import { eventBus } from '../lib/event-bus';
import { parseEmailWithAI } from '../ai/email-parser';

/**
 * Trigger AI parse on a specific email.
 * Uses Claude to extract insurance quote data per PRD Section 7.2.
 * If confidence < 0.8, sets parse_status = 'review_needed'.
 * On confirm: updates SubmissionTarget, emits 'email:parsed'.
 */
export async function triggerParse(emailId: string): Promise<Record<string, unknown>> {
  const email = await emailQueries.findById(emailId);
  if (!email) throw new AppError(404, 'NOT_FOUND', 'Email not found');

  const parsedData = await parseEmailWithAI({
    subject: email.subject as string,
    body_text: email.body_text as string,
    from_address: email.from_address as string,
  });

  if (!parsedData) {
    // AI unavailable — mark as review needed
    const updated = await emailQueries.updateParsedData(emailId, {}, 'review_needed');
    return updated ?? email;
  }

  const parseStatus = parsedData.confidence_score < 0.8 ? 'review_needed' : 'parsed';

  const updated = await emailQueries.updateParsedData(
    emailId,
    parsedData as unknown as Record<string, unknown>,
    parseStatus,
  );

  if (parseStatus === 'parsed') {
    await eventBus.emit('email:parsed', {
      email_id: emailId,
      target_id: (email.submission_id as string) || undefined,
      confidence: parsedData.confidence_score,
    });
  }

  return updated ?? email;
}

/**
 * Confirm a parsed email (override review_needed status).
 * Updates status to 'confirmed' and emits event.
 */
export async function confirmParse(
  emailId: string,
  confirmedData?: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const email = await emailQueries.findById(emailId);
  if (!email) throw new AppError(404, 'NOT_FOUND', 'Email not found');

  const existingParsedData = (email.parsed_data as Record<string, unknown>) ?? {};
  const finalData = confirmedData ? { ...existingParsedData, ...confirmedData } : existingParsedData;

  const updated = await emailQueries.updateParsedData(emailId, finalData, 'confirmed');

  const confidence = (finalData as Record<string, unknown>).confidence_score ?? (existingParsedData as Record<string, unknown>).confidence_score ?? 1.0;

  await eventBus.emit('email:parsed', {
    email_id: emailId,
    target_id: (email.submission_id as string) || undefined,
    confidence: confidence as number,
  });

  return updated ?? email;
}
