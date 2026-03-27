import React from 'react';
import { Text, type TextProps } from 'react-native';
import { CurrencyUtils } from '@core/utils/CurrencyUtils';
import { Colors, Typography } from '@core/theme';
import type { TransactionType } from '@features/transaction/types/Transaction';

interface AmountTextProps extends TextProps {
  amount: number;
  currency: string;
  type?: TransactionType;
  size?: 'small' | 'medium' | 'large';
}

/**
 * AmountText — formats and color-codes a financial amount.
 * CREDIT = green, DEBIT = red, TRANSFER = orange, no type = default text color.
 */
export function AmountText({
  amount,
  currency,
  type,
  size = 'medium',
  style,
  ...rest
}: AmountTextProps) {
  const color = type === 'CREDIT'
    ? Colors.income
    : type === 'DEBIT'
    ? Colors.expense
    : type === 'TRANSFER'
    ? Colors.transfer
    : Colors.text.primary;

  const typography =
    size === 'large'
      ? Typography.amountLarge
      : size === 'small'
      ? Typography.amountSmall
      : Typography.amountMedium;

  const prefix = type === 'CREDIT' ? '+' : type === 'DEBIT' ? '-' : '';
  const formatted = CurrencyUtils.formatAmount(amount, currency);

  return (
    <Text style={[typography, { color }, style]} {...rest}>
      {prefix}{formatted}
    </Text>
  );
}
