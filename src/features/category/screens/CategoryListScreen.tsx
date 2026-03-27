import React, { useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useCategoryStore } from '@features/category/store/categoryStore';
import { CategoryBadge } from '@core/components/CategoryBadge';
import { EmptyState } from '@core/components/EmptyState';
import { LoadingSpinner } from '@core/components/LoadingOverlay';
import { Colors, Typography, Spacing, BorderRadius } from '@core/theme';
import type { Category } from '@features/category/types/Category';

export function CategoryListScreen() {
  const router = useRouter();
  const { state, dispatch } = useCategoryStore();

  useEffect(() => {
    dispatch({ type: 'LOAD_CATEGORIES' });
  }, []);

  const handleAdd = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTED' });
    router.push('/categories/upsert');
  }, [dispatch, router]);

  const handlePress = useCallback(
    (category: Category) => {
      dispatch({ type: 'SELECT_CATEGORY', id: category.id });
      router.push('/categories/upsert');
    },
    [dispatch, router],
  );

  if (state.isLoading && state.categories.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={state.categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => handlePress(item)}
            onLongPress={() =>
              Alert.alert(item.name, 'Delete this category?', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => dispatch({ type: 'DELETE_CATEGORY', id: item.id }),
                },
              ])
            }
          >
            <CategoryBadge category={item} />
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={state.categories.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          <EmptyState
            title="No categories"
            subtitle="Add a category to organize your transactions"
            actionLabel="Add Category"
            onAction={handleAdd}
          />
        }
      />

      <TouchableOpacity style={styles.fab} onPress={handleAdd} activeOpacity={0.85}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
  },
  separator: { height: 1, backgroundColor: Colors.divider },
  arrow: { ...Typography.headlineSmall, color: Colors.text.tertiary },
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
