import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type TouchableOpacityProps,
  View,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@core/theme';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  label,
  variant = 'primary',
  loading = false,
  icon,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        isDisabled && styles.disabled,
        style,
      ]}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? Colors.text.inverse : Colors.primary}
          size="small"
        />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text style={[styles.label, styles[`label_${variant}` as keyof typeof styles]]}>
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  icon: {
    marginRight: Spacing.xs,
  },
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  danger: {
    backgroundColor: Colors.error,
  },
  ghost: {
    backgroundColor: Colors.transparent,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    ...Typography.labelLarge,
  },
  label_primary: {
    color: Colors.text.inverse,
  },
  label_secondary: {
    color: Colors.primary,
  },
  label_danger: {
    color: Colors.text.inverse,
  },
  label_ghost: {
    color: Colors.primary,
  },
});
