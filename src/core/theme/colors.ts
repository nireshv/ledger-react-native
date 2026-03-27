/**
 * Color tokens for the Ledger design system.
 * Supports light and dark modes.
 */

export const Colors = {
  // Brand
  primary: '#3b82f6',     // blue-500
  primaryLight: '#bfdbfe', // blue-200
  primaryDark: '#1d4ed8',  // blue-700

  // Semantic
  income: '#22c55e',    // green-500
  expense: '#ef4444',   // red-500
  transfer: '#f97316',  // orange-500

  // Neutral
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceVariant: '#f1f5f9',
  border: '#e2e8f0',
  divider: '#f1f5f9',

  // Dark mode equivalents
  dark: {
    background: '#0f172a',
    surface: '#1e293b',
    surfaceVariant: '#334155',
    border: '#475569',
    divider: '#334155',
  },

  // Text
  text: {
    primary: '#0f172a',
    secondary: '#64748b',
    tertiary: '#94a3b8',
    inverse: '#ffffff',
    disabled: '#cbd5e1',
  },

  // Status
  error: '#ef4444',
  errorLight: '#fee2e2',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  success: '#22c55e',
  successLight: '#dcfce7',

  // Misc
  overlay: 'rgba(0,0,0,0.5)',
  transparent: 'transparent',
} as const;
