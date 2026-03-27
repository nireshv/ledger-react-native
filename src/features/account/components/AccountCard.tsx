import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Account } from '../types/Account';
import { AmountText } from '@core/components/AmountText';
import { ColorUtils } from '@core/utils/ColorUtils';
import { Typography, Spacing, BorderRadius } from '@core/theme';

interface AccountCardProps {
  account: Account;
  onPress: () => void;
}

export function AccountCard({ account, onPress }: AccountCardProps) {
  const textColor = ColorUtils.contrastingTextColor(account.colorHex);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: account.colorHex }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.header}>
        <Text style={[Typography.titleLarge, { color: textColor }]} numberOfLines={1}>
          {account.name}
        </Text>
        {!account.isIncludedInTotal && (
          <Text style={[Typography.labelSmall, { color: textColor, opacity: 0.7 }]}>
            Excluded
          </Text>
        )}
      </View>
      <Text style={[Typography.labelMedium, { color: textColor, opacity: 0.8, marginTop: 4 }]}>
        {account.currency}
      </Text>
      <AmountText
        amount={account.balance}
        currency={account.currency}
        size="large"
        style={{ color: textColor, marginTop: Spacing.sm }}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    minWidth: 180,
    maxWidth: 220,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.xs,
  },
});
