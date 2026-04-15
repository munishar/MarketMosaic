/**
 * AI Email Parser — Claude-powered insurance quote data extraction.
 * Uses the 7-stage pipeline from PRD Section 7.2.
 */

export interface ParsedEmailData {
  type: string;
  premium: number | null;
  limits: string | null;
  deductible: number | null;
  sir: number | null;
  terms: string[];
  conditions: string[];
  exclusions: string[];
  effective_date: string | null;
  carrier: string | null;
  underwriter_name: string | null;
  confidence_score: number;
}

export interface ParseEmailInput {
  subject: string;
  body_text: string;
  from_address: string;
}

const SYSTEM_PROMPT = `You are an expert insurance email parser for a commercial lines insurance brokerage.
Analyze the provided email and extract structured quote/submission data.

You must return a JSON object with these fields:
- type: string (one of: "quote", "indication", "bind_confirmation", "declination", "information_request", "general")
- premium: number or null (annual premium in USD)
- limits: string or null (e.g., "$1M/$2M")
- deductible: number or null (deductible amount in USD)
- sir: number or null (self-insured retention in USD)
- terms: string[] (key policy terms)
- conditions: string[] (conditions or requirements)
- exclusions: string[] (policy exclusions)
- effective_date: string or null (ISO date format if found)
- carrier: string or null (insurance carrier name)
- underwriter_name: string or null (underwriter's name)
- confidence_score: number (0.0 to 1.0, your confidence in the extraction accuracy)

Only return valid JSON. Do not include any other text.`;

/**
 * Parse an email using Claude AI for insurance data extraction.
 * Requires ANTHROPIC_API_KEY environment variable.
 * Returns parsed data or null if AI service is unavailable.
 */
export async function parseEmailWithAI(input: ParseEmailInput): Promise<ParsedEmailData | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn('[EmailParser] ANTHROPIC_API_KEY not set — skipping AI parse');
    return null;
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Parse the following insurance email:\n\nFrom: ${input.from_address}\nSubject: ${input.subject}\n\nBody:\n${input.body_text}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error(`[EmailParser] Claude API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const result = await response.json() as {
      content: Array<{ type: string; text?: string }>;
    };

    const textBlock = result.content.find((c) => c.type === 'text');
    if (!textBlock?.text) return null;

    const parsed = JSON.parse(textBlock.text) as ParsedEmailData;

    // Validate required fields
    if (typeof parsed.confidence_score !== 'number') {
      parsed.confidence_score = 0.5;
    }
    if (!Array.isArray(parsed.terms)) parsed.terms = [];
    if (!Array.isArray(parsed.conditions)) parsed.conditions = [];
    if (!Array.isArray(parsed.exclusions)) parsed.exclusions = [];

    return parsed;
  } catch (error) {
    console.error('[EmailParser] Error parsing email with AI:', error);
    return null;
  }
}
