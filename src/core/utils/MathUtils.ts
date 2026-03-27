/**
 * MathUtils — pure math helpers equivalent to Android's Math utilities.
 */

export const MathUtils = {
  /**
   * Round a number to the given decimal places.
   */
  round(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  },

  /**
   * Calculate the percentage that `part` is of `total`.
   * Returns 0 if total is 0 to avoid division by zero.
   */
  percentage(part: number, total: number): number {
    if (total === 0) return 0;
    return MathUtils.round((part / total) * 100, 1);
  },

  /**
   * Sum an array of numbers.
   */
  sum(values: number[]): number {
    return values.reduce((acc, v) => acc + v, 0);
  },

  /**
   * Clamp a value between min and max.
   */
  clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  },
};
