import {
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  format,
  parseISO,
  isWithinInterval,
  differenceInDays,
} from 'date-fns';
import type { Duration } from '@core/types/Duration';

export const DateUtils = {
  /**
   * Build a Month Duration for the given date (defaults to today).
   */
  monthDuration(date: Date = new Date()): Duration {
    return {
      type: 'MONTH',
      startDate: startOfMonth(date),
      endDate: endOfMonth(date),
    };
  },

  /**
   * Build a Year Duration for the given date (defaults to today).
   */
  yearDuration(date: Date = new Date()): Duration {
    return {
      type: 'YEAR',
      startDate: startOfYear(date),
      endDate: endOfYear(date),
    };
  },

  /**
   * Build a Custom Duration between two dates.
   */
  customDuration(startDate: Date, endDate: Date): Duration {
    return { type: 'CUSTOM', startDate, endDate };
  },

  /** Format a date for display (e.g. "Mar 27, 2026") */
  formatDisplay(date: Date): string {
    return format(date, 'MMM d, yyyy');
  },

  /** Format a date as ISO 8601 string for SQLite storage */
  toISOString(date: Date): string {
    return date.toISOString();
  },

  /** Parse an ISO string back to a Date */
  fromISOString(iso: string): Date {
    return parseISO(iso);
  },

  /** Check if a date falls within a Duration's range */
  isWithinDuration(date: Date, duration: Duration): boolean {
    return isWithinInterval(date, {
      start: duration.startDate,
      end: duration.endDate,
    });
  },

  /** Human-readable label for a Duration */
  durationLabel(duration: Duration): string {
    if (duration.type === 'MONTH') {
      return format(duration.startDate, 'MMMM yyyy');
    }
    if (duration.type === 'YEAR') {
      return format(duration.startDate, 'yyyy');
    }
    const days = differenceInDays(duration.endDate, duration.startDate) + 1;
    return `${DateUtils.formatDisplay(duration.startDate)} – ${DateUtils.formatDisplay(duration.endDate)} (${days}d)`;
  },

  /** Format a date for a transaction list group header */
  formatGroupHeader(date: Date): string {
    return format(date, 'EEEE, MMMM d');
  },
};
