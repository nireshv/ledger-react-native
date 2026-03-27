/**
 * ColorUtils — hex ↔ RGB conversion and contrast helpers.
 * Equivalent to Android's Color utility functions.
 */

export const ColorUtils = {
  /**
   * Parse a hex color string to RGB components.
   * Accepts "#RRGGBB" or "#RGB" formats.
   */
  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const sanitized = hex.replace('#', '');
    const expanded =
      sanitized.length === 3
        ? sanitized
            .split('')
            .map((c) => c + c)
            .join('')
        : sanitized;

    const num = parseInt(expanded, 16);
    if (isNaN(num)) return null;

    return {
      r: (num >> 16) & 0xff,
      g: (num >> 8) & 0xff,
      b: num & 0xff,
    };
  },

  /**
   * Convert RGB components to a hex string (e.g. "#ff5733").
   */
  rgbToHex(r: number, g: number, b: number): string {
    return (
      '#' +
      [r, g, b]
        .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'))
        .join('')
    );
  },

  /**
   * Determine whether white or black text has better contrast against a background hex.
   * Uses WCAG relative luminance formula.
   */
  contrastingTextColor(backgroundHex: string): '#ffffff' | '#000000' {
    const rgb = ColorUtils.hexToRgb(backgroundHex);
    if (!rgb) return '#000000';

    const toLinear = (v: number) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };

    const L = 0.2126 * toLinear(rgb.r) + 0.7152 * toLinear(rgb.g) + 0.0722 * toLinear(rgb.b);
    return L > 0.179 ? '#000000' : '#ffffff';
  },

  /**
   * A curated palette for category/account color picking.
   */
  palette(): string[] {
    return [
      '#ef4444', // red
      '#f97316', // orange
      '#eab308', // yellow
      '#22c55e', // green
      '#14b8a6', // teal
      '#3b82f6', // blue
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#64748b', // slate
      '#78716c', // stone
      '#10b981', // emerald
      '#6366f1', // indigo
      '#f43f5e', // rose
      '#0ea5e9', // sky
      '#a855f7', // violet
    ];
  },

  /**
   * Add opacity to a hex color, returning an rgba string.
   */
  withOpacity(hex: string, opacity: number): string {
    const rgb = ColorUtils.hexToRgb(hex);
    if (!rgb) return hex;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
  },
};
