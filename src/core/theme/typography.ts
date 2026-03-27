import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const Typography = {
  // Display
  displayLarge: { fontFamily, fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
  displayMedium: { fontFamily, fontSize: 28, fontWeight: '700' as const, lineHeight: 36 },

  // Headline
  headlineLarge: { fontFamily, fontSize: 24, fontWeight: '600' as const, lineHeight: 32 },
  headlineMedium: { fontFamily, fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  headlineSmall: { fontFamily, fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },

  // Title
  titleLarge: { fontFamily, fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
  titleMedium: { fontFamily, fontSize: 14, fontWeight: '600' as const, lineHeight: 20 },

  // Body
  bodyLarge: { fontFamily, fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyMedium: { fontFamily, fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  bodySmall: { fontFamily, fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },

  // Label
  labelLarge: { fontFamily, fontSize: 14, fontWeight: '500' as const, lineHeight: 20 },
  labelMedium: { fontFamily, fontSize: 12, fontWeight: '500' as const, lineHeight: 16 },
  labelSmall: { fontFamily, fontSize: 11, fontWeight: '500' as const, lineHeight: 16 },

  // Amount (monospace-style for financial figures)
  amountLarge: { fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }), fontSize: 28, fontWeight: '700' as const, lineHeight: 36 },
  amountMedium: { fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }), fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  amountSmall: { fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }), fontSize: 14, fontWeight: '500' as const, lineHeight: 20 },
} as const;
