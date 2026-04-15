/**
 * Format a number as US currency.
 * Returns empty string for null/undefined.
 */
export declare function formatCurrency(value: number | null | undefined): string;
/**
 * Format an ISO date string to a locale-friendly display string.
 * Returns empty string for null/undefined.
 */
export declare function formatDate(value: string | null | undefined, options?: Intl.DateTimeFormatOptions): string;
/**
 * Format a 10-digit phone string as (XXX) XXX-XXXX.
 * Returns original value if not 10 digits.
 */
export declare function formatPhone(value: string | null | undefined): string;
/**
 * Format a number as a percentage string.
 * @param value - decimal (e.g. 0.85 for 85%)
 * @param decimals - number of decimal places (default 1)
 */
export declare function formatPercent(value: number | null | undefined, decimals?: number): string;
//# sourceMappingURL=formatting.d.ts.map