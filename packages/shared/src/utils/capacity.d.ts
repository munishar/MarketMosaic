/**
 * Calculate the available capacity from max and deployed amounts.
 * All values are treated as currency strings and returned as a number.
 */
export declare function calculateAvailableCapacity(maxLimit: string | number | null | undefined, deployedCapacity: string | number | null | undefined): number;
/**
 * Calculate capacity utilization as a decimal (0-1).
 * Returns 0 if maxLimit is 0 or missing.
 */
export declare function calculateCapacityUtilization(maxLimit: string | number | null | undefined, deployedCapacity: string | number | null | undefined): number;
/**
 * Get a human-readable capacity status label based on utilization.
 */
export declare function getCapacityStatus(maxLimit: string | number | null | undefined, deployedCapacity: string | number | null | undefined): 'available' | 'limited' | 'full';
//# sourceMappingURL=capacity.d.ts.map