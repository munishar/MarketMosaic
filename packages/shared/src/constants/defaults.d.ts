export declare const PAGINATION_DEFAULTS: {
    readonly page: 1;
    readonly limit: 25;
    readonly max_limit: 100;
};
export declare const FRESHNESS_THRESHOLDS: Record<string, number>;
export declare const JWT_DEFAULTS: {
    readonly access_token_expiry: "15m";
    readonly refresh_token_expiry: "7d";
};
export declare const RENEWAL_WINDOWS: readonly [120, 90, 60, 30];
export declare const EMAIL_PARSE_CONFIDENCE_THRESHOLD = 0.8;
//# sourceMappingURL=defaults.d.ts.map