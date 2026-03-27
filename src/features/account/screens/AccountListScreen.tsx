import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAccountStore } from '@features/account/store/accountStore';
import { AccountCard } from '@features/account/components/AccountCard';
import { AmountText } from '@core/components/AmountText';
import { EmptyState } from '@core/components/EmptyState';
import { LoadingSpinner } from '@core/components/LoadingOverlay';
import { Card } from '@core/components/Card';
import { Colors, Typography, Spacing, BorderRadius } from '@core/theme';
import type { Account } from '@features/account/types/Account';

export function AccountListScreen() {
  const router = useRouter();
  const { state, dispatch } = useAccountStore();

  useEffect(() => {
    dispatch({ type: 'LOAD_ACCOUNTS' });
  }, []);

  const handleAdd = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTED' });
    router.push('/accounts/upsert');
  }, [dispatch, router]);

  const handlePress = useCallback(
    (account: Account) => {
      dispatch({ type: 'SELECT_ACCOUNT', id: account.id });
      router.push('/accounts/upsert');
    },
    [dispatch, router],
  );

  const handleLongPress = useCallback(
    (account: Account) => {
      Alert.alert(account.name, 'What would you like to do?', [
        {
          text: account.isIncludedInTotal ? 'Exclude from total' : 'Include in total',
          onPress: () =>
            dispatch({ type: 'TOGGLE_IN_TOTAL', id: account.id, included: !account.isIncludedInTotal }),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            Alert.alert('Delete Account', 'All transactions will also be deleted. This cannot be undone.', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => dispatch({ type: 'DELETE_ACCOUNT', id: account.id }),
              },
            ]),
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    },
    [dispatch],
  );

  if (state.isLoading && state.accounts.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      {/* Total Balance Summary */}
      {state.totalBalances.length > 0 && (
        <Card style={styles.totalCard} elevated>
          <Text style={styles.totalLabel}>Total Balance</Text>
          {state.totalBalances.map((b) => (
            <AmountText
              key={b.currency}
              amount={b.balance}
              currency={b.currency}
              size="large"
              style={{ color: b.balance >= 0 ? Colors.income : Colors.expense }}
            />
          ))}
        </Card>
      )}

      {/* Account List */}
      <FlatList
        data={state.accounts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handlePress(item)}
            onLongPress={() => handleLongPress(item)}
            style={styles.cardWrapper}
          >
            <AccountCard account={item} onPress={() => handlePress(item)} />
          </TouchableOpacity>
        )}
        horizontal={false}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            title="No accounts yet"
            subtitle="Add your first account to start tracking"
            actionLabel="Add Account"
            onAction={handleAdd}
          />
        }
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleAdd} activeOpacity={0.85}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  totalCard: { margin: Spacing.base, marginBottom: 0 },
  totalLabel: { ...Typography.labelMedium, color: Colors.text.secondary, marginBottom: Spacing.xs },
  listContent: { padding: Spacing.base, paddingBottom: Spacing['3xl'] },
  row: { gap: Spacing.sm, marginBottom: Spacing.sm },
  cardWrapper: { flex: 1 },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  fabIcon: { ...Typography.headlineLarge, color: Colors.text.inverse },
});
