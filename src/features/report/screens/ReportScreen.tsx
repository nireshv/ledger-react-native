import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useReportStore } from '@features/report/store/reportStore';
import { Card } from '@core/components/Card';
import { AmountText } from '@core/components/AmountText';
import { LoadingSpinner } from '@core/components/LoadingOverlay';
import { EmptyState } from '@core/components/EmptyState';
import { Colors, Typography, Spacing, BorderRadius } from '@core/theme';
import { DateUtils } from '@core/utils/DateUtils';
import type { TransactionType } from '@features/transaction/types/Transaction';

const TYPE_LABELS: Record<TransactionType, string> = {
  CREDIT: 'Income',
  DEBIT: 'Expense',
  TRANSFER: 'Transfer',
};

const TYPE_ICONS: Record<TransactionType, string> = {
  CREDIT: '↓',
  DEBIT: '↑',
  TRANSFER: '⇄',
};

export function ReportScreen() {
  const { state, dispatch } = useReportStore();

  useEffect(() => {
    dispatch({ type: 'LOAD_REPORT' });
  }, []);

  const onRefresh = useCallback(() => dispatch({ type: 'LOAD_REPORT' }), [dispatch]);

  if (state.isLoading && state.entries.length === 0) {
    return <LoadingSpinner />;
  }

  // Group entries by currency
  const byCurrency: Record<string, typeof state.entries> = {};
  for (const entry of state.entries) {
    if (!byCurrency[entry.currency]) byCurrency[entry.currency] = [];
    byCurrency[entry.currency].push(entry);
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={state.isLoading} onRefresh={onRefresh} />}
    >
      {/* Duration selector */}
      <View style={styles.durationRow}>
        {(['MONTH', 'YEAR'] as const).map((type) => {
          const duration = type === 'MONTH' ? DateUtils.monthDuration() : DateUtils.yearDuration();
          const isActive = state.duration.type === type;
          return (
            <TouchableOpacity
              key={type}
              style={[styles.durationButton, isActive && styles.durationButtonActive]}
              onPress={() => dispatch({ type: 'SET_DURATION', duration })}
            >
              <Text
                style={[
                  Typography.labelLarge,
                  { color: isActive ? Colors.text.inverse : Colors.text.secondary },
                ]}
              >
                {type === 'MONTH' ? 'This Month' : 'This Year'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.periodLabel}>{DateUtils.durationLabel(state.duration)}</Text>

      {Object.keys(byCurrency).length === 0 && !state.isLoading && (
        <EmptyState
          title="No data for this period"
          subtitle="Add transactions to see reports"
        />
      )}

      {Object.entries(byCurrency).map(([currency, entries]) => (
        <Card key={currency} style={styles.currencyGroup}>
          <Text style={styles.currencyHeader}>{currency}</Text>
          {entries.map((entry) => (
            <View key={`${entry.currency}_${entry.type}`} style={styles.entryRow}>
              <View style={styles.entryLeft}>
                <Text style={[styles.typeIcon, { color: getTypeColor(entry.type as TransactionType) }]}>
                  {TYPE_ICONS[entry.type as TransactionType]}
                </Text>
                <View>
                  <Text style={styles.typeName}>{TYPE_LABELS[entry.type as TransactionType]}</Text>
                  <Text style={styles.count}>{entry.count} transactions</Text>
                </View>
              </View>
              <AmountText
                amount={entry.total}
                currency={entry.currency}
                type={entry.type as TransactionType}
                size="medium"
              />
            </View>
          ))}
        </Card>
      ))}
    </ScrollView>
  );
}

function getTypeColor(type: TransactionType): string {
  switch (type) {
    case 'CREDIT': return Colors.income;
    case 'DEBIT': return Colors.expense;
    case 'TRANSFER': return Colors.transfer;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, paddingBottom: Spacing['3xl'] },
  durationRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.md,
    padding: 4,
    marginBottom: Spacing.base,
  },
  durationButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md - 2,
    alignItems: 'center',
  },
  durationButtonActive: { backgroundColor: Colors.primary },
  periodLabel: {
    ...Typography.labelLarge,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.base,
  },
  currencyGroup: { marginBottom: Spacing.md },
  currencyHeader: {
    ...Typography.headlineSmall,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  entryLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  typeIcon: { ...Typography.headlineSmall, width: 28, textAlign: 'center' },
  typeName: { ...Typography.titleMedium, color: Colors.text.primary },
  count: { ...Typography.bodySmall, color: Colors.text.secondary },
});
