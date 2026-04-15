/**
 * AI Import Enricher — per-contact corpus analysis for relationship strength,
 * topics, and sentiment after email import.
 */

export interface EnrichmentResult {
  contact_id: string;
  relationship_strength: number;
  topics: string[];
  sentiment: string;
  summary: string;
  email_count: number;
}

export interface EnrichmentInput {
  contact_id: string;
  contact_name: string;
  emails: Array<{
    subject: string;
    body_text: string;
    direction: string;
    sent_at: string;
  }>;
}

const ENRICHMENT_SYSTEM_PROMPT = `You are an AI assistant analyzing email communication between an insurance broker and a contact.
Analyze the provided email corpus and return a JSON object with:
- relationship_strength: number (0.0 to 1.0, based on frequency, tone, responsiveness)
- topics: string[] (key topics discussed, e.g., "General Liability", "Renewal", "Claims")
- sentiment: string (one of: "positive", "neutral", "negative", "mixed")
- summary: string (2-3 sentence summary of the relationship and communication patterns)

Only return valid JSON. Do not include any other text.`;

/**
 * Enrich a contact's relationship data using AI analysis of their email corpus.
 * Requires ANTHROPIC_API_KEY environment variable.
 */
export async function enrichContactEmails(input: EnrichmentInput): Promise<EnrichmentResult | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn('[ImportEnricher] ANTHROPIC_API_KEY not set — skipping enrichment');
    return null;
  }

  try {
    // Build corpus summary (limit to avoid token overflow)
    const emailSummaries = input.emails.slice(0, 50).map((e) => {
      const truncatedBody = e.body_text.length > 500 ? e.body_text.slice(0, 500) + '...' : e.body_text;
      return `[${e.direction}] ${e.sent_at} - Subject: ${e.subject}\n${truncatedBody}`;
    }).join('\n\n---\n\n');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: ENRICHMENT_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Analyze the email communication with ${input.contact_name} (${input.emails.length} emails):\n\n${emailSummaries}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error(`[ImportEnricher] Claude API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const result = await response.json() as {
      content: Array<{ type: string; text?: string }>;
    };

    const textBlock = result.content.find((c) => c.type === 'text');
    if (!textBlock?.text) return null;

    const parsed = JSON.parse(textBlock.text) as {
      relationship_strength: number;
      topics: string[];
      sentiment: string;
      summary: string;
    };

    return {
      contact_id: input.contact_id,
      relationship_strength: parsed.relationship_strength ?? 0.5,
      topics: parsed.topics ?? [],
      sentiment: parsed.sentiment ?? 'neutral',
      summary: parsed.summary ?? '',
      email_count: input.emails.length,
    };
  } catch (error) {
    console.error('[ImportEnricher] Error enriching contact emails:', error);
    return null;
  }
}
