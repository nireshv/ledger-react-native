import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTransactionStore } from '@features/transaction/store/transactionStore';
import { useAccountStore } from '@features/account/store/accountStore';
import { useCategoryStore } from '@features/category/store/categoryStore';
import { TransactionListItem } from '@features/transaction/components/TransactionListItem';
import { EmptyState } from '@core/components/EmptyState';
import { LoadingSpinner } from '@core/components/LoadingOverlay';
import { Colors, Typography, Spacing, BorderRadius } from '@core/theme';
import type { Transaction } from '@features/transaction/types/Transaction';

export function TransactionListScreen() {
  const router = useRouter();
  const { state, dispatch } = useTransactionStore();
  const { state: accountState } = useAccountStore();
  const { state: categoryState } = useCategoryStore();

  useEffect(() => {
    dispatch({ type: 'LOAD_TRANSACTIONS' });
  }, []);

  const accountMap = new Map(accountState.accounts.map((a) => [a.id, a]));
  const categoryMap = new Map(categoryState.categories.map((c) => [c.id, c]));

  const handlePress = useCallback(
    (transaction: Transaction) => {
      dispatch({ type: 'SELECT_TRANSACTION', id: transaction.id });
      router.push('/transactions/upsert');
    },
    [dispatch, router],
  );

  const handleAddNew = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTED' });
    router.push('/transactions/upsert');
  }, [dispatch, router]);

  const handleLongPress = useCallback(
    (transaction: Transaction) => {
      Alert.alert('Transaction', 'What would you like to do?', [
        {
          text: transaction.isIncluded ? 'Exclude from reports' : 'Include in reports',
          onPress: () =>
            dispatch({
              type: 'TOGGLE_INCLUSION',
              id: transaction.id,
              isIncluded: !transaction.isIncluded,
            }),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            Alert.alert('Delete Transaction', 'This cannot be undone.', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => dispatch({ type: 'DELETE_TRANSACTION', id: transaction.id }),
              },
            ]),
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    },
    [dispatch],
  );

  if (state.isLoading && state.transactions.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          placeholderTextColor={Colors.text.tertiary}
          value={state.searchQuery}
          onChangeText={(q) => dispatch({ type: 'SET_SEARCH_QUERY', query: q })}
          clearButtonMode="while-editing"
        />
      </View>

      {/* List */}
      <FlatList
        data={state.transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionListItem
            transaction={item}
            account={item.accountId ? accountMap.get(item.accountId) : undefined}
            category={item.categoryId ? categoryMap.get(item.categoryId) : undefined}
            onPress={() => handlePress(item)}
          />
        )}
        onLongPress={undefined}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <EmptyState
            title="No transactions"
            subtitle="Tap + to add your first transaction"
            actionLabel="Add Transaction"
            onAction={handleAddNew}
          />
        }
        contentContainerStyle={state.transactions.length === 0 ? styles.emptyContainer : undefined}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleAddNew} activeOpacity={0.85}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchBar: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInput: {
    ...Typography.bodyLarge,
    color: Colors.text.primary,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    height: 40,
  },
  separator: { height: 1, backgroundColor: Colors.divider },
  emptyContainer: { flex: 1 },
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
