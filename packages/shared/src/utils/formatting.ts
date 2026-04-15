/**
 * Format a number as US currency.
 * Returns empty string for null/undefined.
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format an ISO date string to a locale-friendly display string.
 * Returns empty string for null/undefined.
 */
export function formatDate(
  value: string | null | undefined,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!value) return '';
  const defaults: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return new Date(value).toLocaleDateString('en-US', options ?? defaults);
}

/**
 * Format a 10-digit phone string as (XXX) XXX-XXXX.
 * Returns original value if not 10 digits.
 */
export function formatPhone(value: string | null | undefined): string {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return value;
}

/**
 * Format a number as a percentage string.
 * @param value - decimal (e.g. 0.85 for 85%)
 * @param decimals - number of decimal places (default 1)
 */
export function formatPercent(
  value: number | null | undefined,
  decimals = 1,
): string {
  if (value == null) return '';
  return `${(value * 100).toFixed(decimals)}%`;
}
