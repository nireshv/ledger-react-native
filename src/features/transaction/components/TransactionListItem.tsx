import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Transaction } from '../types/Transaction';
import type { Account } from '@features/account/types/Account';
import type { Category } from '@features/category/types/Category';
import { AmountText } from '@core/components/AmountText';
import { CategoryBadge } from '@core/components/CategoryBadge';
import { Colors, Typography, Spacing, BorderRadius } from '@core/theme';
import { DateUtils } from '@core/utils/DateUtils';

interface TransactionListItemProps {
  transaction: Transaction;
  account?: Account;
  category?: Category;
  onPress: () => void;
}

const TYPE_ICONS: Record<string, string> = {
  CREDIT: '↓',
  DEBIT: '↑',
  TRANSFER: '⇄',
};

export function TransactionListItem({
  transaction,
  account,
  category,
  onPress,
}: TransactionListItemProps) {
  return (
    <TouchableOpacity
      style={[styles.container, !transaction.isIncluded && styles.excluded]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Type indicator */}
      <View
        style={[
          styles.typeIcon,
          { backgroundColor: getTypeColor(transaction.type) + '20' },
        ]}
      >
        <Text style={[styles.typeEmoji, { color: getTypeColor(transaction.type) }]}>
          {TYPE_ICONS[transaction.type]}
        </Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.note} numberOfLines={1}>
            {transaction.note || transaction.type.toLowerCase()}
          </Text>
          <AmountText
            amount={transaction.amount}
            currency={transaction.currency}
            type={transaction.type}
            size="small"
          />
        </View>
        <View style={styles.meta}>
          <Text style={styles.date}>{DateUtils.formatDisplay(transaction.date)}</Text>
          {account && (
            <Text style={styles.accountName} numberOfLines={1}>
              · {account.name}
            </Text>
          )}
          {category && <CategoryBadge category={category} size="small" />}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'CREDIT': return Colors.income;
    case 'DEBIT': return Colors.expense;
    case 'TRANSFER': return Colors.transfer;
    default: return Colors.text.secondary;
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  excluded: {
    opacity: 0.4,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeEmoji: {
    ...Typography.titleLarge,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  note: {
    ...Typography.titleMedium,
    color: Colors.text.primary,
    flex: 1,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  date: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
  accountName: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    flex: 1,
  },
});
