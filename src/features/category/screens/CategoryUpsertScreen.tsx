import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Crypto from 'expo-crypto';
import { useCategoryStore } from '@features/category/store/categoryStore';
import { Button } from '@core/components/Button';
import { Card } from '@core/components/Card';
import { ColorPicker } from '@core/components/ColorPicker';
import { LoadingOverlay } from '@core/components/LoadingOverlay';
import { Colors, Typography, Spacing, BorderRadius } from '@core/theme';
import type { CategoryEffect } from '@features/category/store/categoryStore';

export function CategoryUpsertScreen() {
  const router = useRouter();
  const { state, dispatch, onEffect } = useCategoryStore();
  const editing = state.selectedCategory;

  const [name, setName] = useState(editing?.name ?? '');
  const [colorHex, setColorHex] = useState(editing?.colorHex ?? '#3b82f6');

  useEffect(() => {
    const unsub = onEffect((effect: CategoryEffect) => {
      if (effect.type === 'NAVIGATE_BACK') router.back();
      if (effect.type === 'SHOW_ERROR') Alert.alert('Error', effect.message);
    });
    return unsub;
  }, [onEffect, router]);

  const handleSave = useCallback(() => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Category name is required.');
      return;
    }
    dispatch({
      type: 'UPSERT_CATEGORY',
      category: {
        id: editing?.id ?? Crypto.randomUUID(),
        name: name.trim(),
        colorHex,
        iconName: null,
      },
    });
  }, [dispatch, editing, name, colorHex]);

  return (
    <View style={styles.container}>
      {state.isLoading && <LoadingOverlay />}
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <Card style={styles.field}>
          <Text style={styles.label}>Category Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Food, Transport"
            placeholderTextColor={Colors.text.tertiary}
            autoCapitalize="words"
          />
        </Card>

        <Card style={styles.field}>
          <Text style={styles.label}>Color</Text>
          <ColorPicker selected={colorHex} onSelect={setColorHex} />
        </Card>

        {editing && (
          <Button
            label="Delete Category"
            variant="danger"
            onPress={() =>
              Alert.alert('Delete Category', 'Category will be removed from all transactions. Continue?', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => {
                    dispatch({ type: 'DELETE_CATEGORY', id: editing.id });
                    router.back();
                  },
                },
              ])
            }
          />
        )}

        <Button
          label={editing ? 'Update Category' : 'Save Category'}
          onPress={handleSave}
          loading={state.isLoading}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, gap: Spacing.md, paddingBottom: Spacing['3xl'] },
  field: { gap: Spacing.sm },
  label: { ...Typography.labelMedium, color: Colors.text.secondary },
  input: {
    ...Typography.bodyLarge,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
});
