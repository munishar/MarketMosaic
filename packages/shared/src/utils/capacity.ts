/**
 * Calculate the available capacity from max and deployed amounts.
 * All values are treated as currency strings and returned as a number.
 */
export function calculateAvailableCapacity(
  maxLimit: string | number | null | undefined,
  deployedCapacity: string | number | null | undefined,
): number {
  const max = parseFloat(String(maxLimit ?? '0')) || 0;
  const deployed = parseFloat(String(deployedCapacity ?? '0')) || 0;
  return Math.max(max - deployed, 0);
}

/**
 * Calculate capacity utilization as a decimal (0-1).
 * Returns 0 if maxLimit is 0 or missing.
 */
export function calculateCapacityUtilization(
  maxLimit: string | number | null | undefined,
  deployedCapacity: string | number | null | undefined,
): number {
  const max = parseFloat(String(maxLimit ?? '0')) || 0;
  if (max === 0) return 0;
  const deployed = parseFloat(String(deployedCapacity ?? '0')) || 0;
  return Math.min(deployed / max, 1);
}

/**
 * Get a human-readable capacity status label based on utilization.
 */
export function getCapacityStatus(
  maxLimit: string | number | null | undefined,
  deployedCapacity: string | number | null | undefined,
): 'available' | 'limited' | 'full' {
  const utilization = calculateCapacityUtilization(maxLimit, deployedCapacity);
  if (utilization >= 1) return 'full';
  if (utilization >= 0.8) return 'limited';
  return 'available';
}
