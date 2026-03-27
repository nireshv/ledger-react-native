import React from 'react';
import { View, type ViewProps, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius } from '@core/theme';

interface CardProps extends ViewProps {
  elevated?: boolean;
}

export function Card({ style, elevated = false, children, ...rest }: CardProps) {
  return (
    <View
      style={[styles.card, elevated && styles.elevated, style]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  elevated: {
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
});
