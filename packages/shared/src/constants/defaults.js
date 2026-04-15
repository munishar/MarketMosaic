export const PAGINATION_DEFAULTS = {
    page: 1,
    limit: 25,
    max_limit: 100,
};
export const FRESHNESS_THRESHOLDS = {
    underwriter_capacity: 90,
    contact: 180,
    carrier: 365,
    client: 365,
    form_paper: 365,
};
export const JWT_DEFAULTS = {
    access_token_expiry: '15m',
    refresh_token_expiry: '7d',
};
export const RENEWAL_WINDOWS = [120, 90, 60, 30];
export const EMAIL_PARSE_CONFIDENCE_THRESHOLD = 0.8;
//# sourceMappingURL=defaults.js.map