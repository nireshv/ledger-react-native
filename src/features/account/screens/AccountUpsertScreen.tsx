import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Crypto from 'expo-crypto';
import { useAccountStore } from '@features/account/store/accountStore';
import { Button } from '@core/components/Button';
import { Card } from '@core/components/Card';
import { ColorPicker } from '@core/components/ColorPicker';
import { LoadingOverlay } from '@core/components/LoadingOverlay';
import { Colors, Typography, Spacing, BorderRadius } from '@core/theme';
import { CurrencyUtils } from '@core/utils/CurrencyUtils';
import type { AccountEffect } from '@features/account/store/accountStore';

export function AccountUpsertScreen() {
  const router = useRouter();
  const { state, dispatch, onEffect } = useAccountStore();
  const editing = state.selectedAccount;

  const [name, setName] = useState(editing?.name ?? '');
  const [currency, setCurrency] = useState(editing?.currency ?? 'USD');
  const [colorHex, setColorHex] = useState(editing?.colorHex ?? '#3b82f6');
  const [isIncludedInTotal, setIsIncludedInTotal] = useState(editing?.isIncludedInTotal ?? true);

  useEffect(() => {
    const unsub = onEffect((effect: AccountEffect) => {
      if (effect.type === 'NAVIGATE_BACK') router.back();
      if (effect.type === 'SHOW_ERROR') Alert.alert('Error', effect.message);
    });
    return unsub;
  }, [onEffect, router]);

  const handleSave = useCallback(() => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Account name is required.');
      return;
    }
    dispatch({
      type: 'UPSERT_ACCOUNT',
      account: {
        id: editing?.id ?? Crypto.randomUUID(),
        name: name.trim(),
        currency,
        balance: editing?.balance ?? 0,
        colorHex,
        isIncludedInTotal,
      },
    });
  }, [dispatch, editing, name, currency, colorHex, isIncludedInTotal]);

  return (
    <View style={styles.container}>
      {state.isLoading && <LoadingOverlay />}
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Name */}
        <Card style={styles.field}>
          <Text style={styles.label}>Account Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Checking, Savings, Cash"
            placeholderTextColor={Colors.text.tertiary}
            autoCapitalize="words"
          />
        </Card>

        {/* Currency */}
        <Card style={styles.field}>
          <Text style={styles.label}>Currency</Text>
          <View style={styles.currencyGrid}>
            {CurrencyUtils.commonCurrencies().map((c) => (
              <Button
                key={c}
                label={c}
                variant={currency === c ? 'primary' : 'secondary'}
                onPress={() => setCurrency(c)}
                style={styles.currencyButton}
              />
            ))}
          </View>
        </Card>

        {/* Color */}
        <Card style={styles.field}>
          <Text style={styles.label}>Color</Text>
          <ColorPicker selected={colorHex} onSelect={setColorHex} />
        </Card>

        {/* Include in total */}
        <Card style={[styles.field, styles.row]}>
          <Text style={styles.switchLabel}>Include in total balance</Text>
          <Switch
            value={isIncludedInTotal}
            onValueChange={setIsIncludedInTotal}
            trackColor={{ true: Colors.primary }}
          />
        </Card>

        {/* Delete */}
        {editing && (
          <Button
            label="Delete Account"
            variant="danger"
            onPress={() =>
              Alert.alert('Delete Account', 'All transactions will be deleted. Continue?', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => {
                    dispatch({ type: 'DELETE_ACCOUNT', id: editing.id });
                    router.back();
                  },
                },
              ])
            }
          />
        )}

        <Button
          label={editing ? 'Update Account' : 'Save Account'}
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
  currencyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  currencyButton: { minWidth: 60, height: 36, paddingHorizontal: Spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchLabel: { ...Typography.bodyLarge, color: Colors.text.primary },
});
