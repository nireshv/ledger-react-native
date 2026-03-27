import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useDashboardStore } from '@features/dashboard/store/dashboardStore';
import { Card } from '@core/components/Card';
import { AmountText } from '@core/components/AmountText';
import { LoadingSpinner } from '@core/components/LoadingOverlay';
import { Colors, Typography, Spacing, BorderRadius } from '@core/theme';
import { DateUtils } from '@core/utils/DateUtils';
import { CurrencyUtils } from '@core/utils/CurrencyUtils';
import { MathUtils } from '@core/utils/MathUtils';

export function DashboardScreen() {
  const { state, dispatch } = useDashboardStore();

  useEffect(() => {
    dispatch({ type: 'LOAD_DASHBOARD' });
  }, []);

  const onRefresh = useCallback(() => {
    dispatch({ type: 'REFRESH' });
  }, [dispatch]);

  if (state.isLoading && !state.summary) {
    return <LoadingSpinner />;
  }

  const durationLabel = DateUtils.durationLabel(state.duration);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={state.isLoading} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Dashboard</Text>
        <TouchableOpacity onPress={() => dispatch({ type: 'SET_DURATION', duration: DateUtils.monthDuration() })}>
          <Text style={styles.durationLabel}>{durationLabel}</Text>
        </TouchableOpacity>
      </View>

      {/* Currency Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.currencyRow}>
        {CurrencyUtils.commonCurrencies().slice(0, 6).map((currency) => (
          <TouchableOpacity
            key={currency}
            style={[styles.currencyChip, state.currency === currency && styles.currencyChipActive]}
            onPress={() => dispatch({ type: 'SET_CURRENCY', currency })}
          >
            <Text
              style={[
                Typography.labelMedium,
                { color: state.currency === currency ? Colors.text.inverse : Colors.text.secondary },
              ]}
            >
              {currency}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Summary Cards */}
      {state.summary && (
        <View style={styles.summaryRow}>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Income</Text>
            <AmountText
              amount={state.summary.totalIncome}
              currency={state.currency}
              type="CREDIT"
              size="medium"
            />
          </Card>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Expense</Text>
            <AmountText
              amount={state.summary.totalExpense}
              currency={state.currency}
              type="DEBIT"
              size="medium"
            />
          </Card>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Net</Text>
            <AmountText
              amount={Math.abs(state.summary.netBalance)}
              currency={state.currency}
              type={state.summary.netBalance >= 0 ? 'CREDIT' : 'DEBIT'}
              size="medium"
            />
          </Card>
        </View>
      )}

      {/* Chart placeholder */}
      {state.chartData.length > 0 && (
        <Card style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Income vs Expense</Text>
          <View style={styles.barsContainer}>
            {state.chartData.slice(-6).map((point, index) => {
              const maxVal = Math.max(
                ...state.chartData.map((p) => Math.max(p.income, p.expense)),
                1,
              );
              const incomeH = MathUtils.round((point.income / maxVal) * 80, 0);
              const expenseH = MathUtils.round((point.expense / maxVal) * 80, 0);
              return (
                <View key={`${point.label}-${index}`} style={styles.barGroup}>
                  <View style={styles.bars}>
                    <View style={[styles.bar, { height: incomeH, backgroundColor: Colors.income }]} />
                    <View style={[styles.bar, { height: expenseH, backgroundColor: Colors.expense }]} />
                  </View>
                  <Text style={styles.barLabel}>{point.label}</Text>
                </View>
              );
            })}
          </View>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.income }]} />
              <Text style={styles.legendText}>Income</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.expense }]} />
              <Text style={styles.legendText}>Expense</Text>
            </View>
          </View>
        </Card>
      )}

      {/* Category Breakdown */}
      {state.categoryBreakdown.length > 0 && (
        <Card style={styles.breakdownCard}>
          <Text style={styles.sectionTitle}>Top Categories</Text>
          {state.categoryBreakdown.slice(0, 5).map((item) => (
            <View key={item.category.id} style={styles.breakdownItem}>
              <View style={styles.breakdownLeft}>
                <View
                  style={[styles.categoryDot, { backgroundColor: item.category.colorHex }]}
                />
                <Text style={styles.categoryName} numberOfLines={1}>
                  {item.category.name}
                </Text>
              </View>
              <View style={styles.breakdownRight}>
                <AmountText
                  amount={item.total}
                  currency={state.currency}
                  type="DEBIT"
                  size="small"
                />
                <Text style={styles.percentage}>{item.percentage}%</Text>
              </View>
            </View>
          ))}
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, paddingBottom: Spacing['3xl'] },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  screenTitle: { ...Typography.headlineLarge, color: Colors.text.primary },
  durationLabel: { ...Typography.labelLarge, color: Colors.primary },
  currencyRow: { marginBottom: Spacing.base },
  currencyChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceVariant,
    marginRight: Spacing.sm,
  },
  currencyChipActive: { backgroundColor: Colors.primary },
  summaryRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.base },
  summaryCard: { flex: 1, padding: Spacing.md },
  summaryLabel: { ...Typography.labelSmall, color: Colors.text.secondary, marginBottom: 4 },
  chartCard: { marginBottom: Spacing.base },
  sectionTitle: { ...Typography.titleLarge, color: Colors.text.primary, marginBottom: Spacing.md },
  barsContainer: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.xs, height: 100 },
  barGroup: { flex: 1, alignItems: 'center', gap: 4 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  bar: { width: 8, borderRadius: BorderRadius.sm, minHeight: 2 },
  barLabel: { ...Typography.labelSmall, color: Colors.text.tertiary },
  legend: { flexDirection: 'row', gap: Spacing.base, marginTop: Spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  legendDot: { width: 8, height: 8, borderRadius: BorderRadius.full },
  legendText: { ...Typography.labelSmall, color: Colors.text.secondary },
  breakdownCard: { marginBottom: Spacing.base },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  breakdownLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  categoryDot: { width: 10, height: 10, borderRadius: BorderRadius.full },
  categoryName: { ...Typography.bodyMedium, color: Colors.text.primary, flex: 1 },
  breakdownRight: { alignItems: 'flex-end', gap: 2 },
  percentage: { ...Typography.labelSmall, color: Colors.text.secondary },
});
