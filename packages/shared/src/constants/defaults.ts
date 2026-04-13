export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 25,
  max_limit: 100,
} as const;

export const FRESHNESS_THRESHOLDS: Record<string, number> = {
  underwriter_capacity: 90,
  contact: 180,
  carrier: 365,
  client: 365,
  form_paper: 365,
};

export const JWT_DEFAULTS = {
  access_token_expiry: '15m',
  refresh_token_expiry: '7d',
} as const;

export const RENEWAL_WINDOWS = [120, 90, 60, 30] as const;

export const EMAIL_PARSE_CONFIDENCE_THRESHOLD = 0.8;
