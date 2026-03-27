/**
 * Duration — represents a date range for filtering and reporting.
 * Equivalent to Android's Duration domain model.
 */
export type DurationType = 'MONTH' | 'YEAR' | 'CUSTOM';

export interface Duration {
  type: DurationType;
  startDate: Date;
  endDate: Date;
}

/** Convenience type-guard */
export function isCustomDuration(d: Duration): boolean {
  return d.type === 'CUSTOM';
}
