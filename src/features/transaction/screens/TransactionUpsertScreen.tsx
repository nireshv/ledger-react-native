import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Crypto from 'expo-crypto';
import { useTransactionStore } from '@features/transaction/store/transactionStore';
import { useAccountStore } from '@features/account/store/accountStore';
import { useCategoryStore } from '@features/category/store/categoryStore';
import { Button } from '@core/components/Button';
import { Card } from '@core/components/Card';
import { LoadingOverlay } from '@core/components/LoadingOverlay';
import { Colors, Typography, Spacing, BorderRadius } from '@core/theme';
import type { TransactionType } from '@features/transaction/types/Transaction';
import { CurrencyUtils } from '@core/utils/CurrencyUtils';
import type { TransactionEffect } from '@features/transaction/store/transactionStore';

const TYPES: TransactionType[] = ['DEBIT', 'CREDIT', 'TRANSFER'];
const TYPE_LABELS: Record<TransactionType, string> = {
  DEBIT: 'Expense',
  CREDIT: 'Income',
  TRANSFER: 'Transfer',
};

export function TransactionUpsertScreen() {
  const router = useRouter();
  const { state, dispatch, onEffect } = useTransactionStore();
  const { state: accountState } = useAccountStore();
  const { state: categoryState } = useCategoryStore();

  const editing = state.selectedTransaction;

  const [type, setType] = useState<TransactionType>(editing?.type ?? 'DEBIT');
  const [amount, setAmount] = useState(editing ? String(editing.amount) : '');
  const [currency, setCurrency] = useState(editing?.currency ?? 'USD');
  const [accountId, setAccountId] = useState(editing?.accountId ?? '');
  const [toAccountId, setToAccountId] = useState(editing?.toAccountId ?? '');
  const [categoryId, setCategoryId] = useState(editing?.categoryId ?? '');
  const [exchangeRate, setExchangeRate] = useState(editing ? String(editing.exchangeRate) : '1');
  const [note, setNote] = useState(editing?.note ?? '');
  const [isIncluded, setIsIncluded] = useState(editing?.isIncluded ?? true);
  const [date, setDate] = useState(editing?.date ?? new Date());

  useEffect(() => {
    // Listen for store effects (navigate back on success)
    const unsub = onEffect((effect: TransactionEffect) => {
      if (effect.type === 'NAVIGATE_BACK') router.back();
      if (effect.type === 'SHOW_ERROR') Alert.alert('Error', effect.message);
    });
    return unsub;
  }, [onEffect, router]);

  const handleSave = useCallback(() => {
    const parsedAmount = CurrencyUtils.parseAmount(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid positive amount.');
      return;
    }
    if (!accountId) {
      Alert.alert('Validation Error', 'Please select an account.');
      return;
    }
    if (type === 'TRANSFER' && !toAccountId) {
      Alert.alert('Validation Error', 'Please select a destination account for transfer.');
      return;
    }

    dispatch({
      type: 'UPSERT_TRANSACTION',
      transaction: {
        id: editing?.id ?? Crypto.randomUUID(),
        type,
        amount: parsedAmount,
        currency,
        exchangeRate: parseFloat(exchangeRate) || 1,
        accountId,
        toAccountId: type === 'TRANSFER' ? toAccountId : null,
        categoryId: categoryId || null,
        note,
        date,
        isIncluded,
      },
    });
  }, [dispatch, editing, type, amount, currency, accountId, toAccountId, categoryId, exchangeRate, note, date, isIncluded]);

  const isLoading = state.isLoading;

  return (
    <View style={styles.container}>
      {isLoading && <LoadingOverlay />}

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Transaction Type Selector */}
        <Card style={styles.typeSelector}>
          {TYPES.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.typeButton, type === t && styles.typeButtonActive(t)]}
              onPress={() => setType(t)}
            >
              <Text
                style={[
                  Typography.labelLarge,
                  { color: type === t ? Colors.text.inverse : Colors.text.secondary },
                ]}
              >
                {TYPE_LABELS[t]}
              </Text>
            </TouchableOpacity>
          ))}
        </Card>

        {/* Amount */}
        <Card style={styles.field}>
          <Text style={styles.fieldLabel}>Amount</Text>
          <View style={styles.amountRow}>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={Colors.text.tertiary}
            />
            <TouchableOpacity style={styles.currencyBadge}>
              <Text style={styles.currencyText}>{currency}</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Account */}
        <Card style={styles.field}>
          <Text style={styles.fieldLabel}>Account</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              {accountState.accounts.map((a) => (
                <TouchableOpacity
                  key={a.id}
                  style={[styles.chip, { borderColor: a.colorHex }, accountId === a.id && { backgroundColor: a.colorHex }]}
                  onPress={() => { setAccountId(a.id); setCurrency(a.currency); }}
                >
                  <Text style={[Typography.labelMedium, { color: accountId === a.id ? Colors.text.inverse : Colors.text.primary }]}>
                    {a.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Card>

        {/* To Account (Transfer only) */}
        {type === 'TRANSFER' && (
          <Card style={styles.field}>
            <Text style={styles.fieldLabel}>To Account</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                {accountState.accounts
                  .filter((a) => a.id !== accountId)
                  .map((a) => (
                    <TouchableOpacity
                      key={a.id}
                      style={[styles.chip, { borderColor: a.colorHex }, toAccountId === a.id && { backgroundColor: a.colorHex }]}
                      onPress={() => setToAccountId(a.id)}
                    >
                      <Text style={[Typography.labelMedium, { color: toAccountId === a.id ? Colors.text.inverse : Colors.text.primary }]}>
                        {a.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>
            </ScrollView>
            <Text style={styles.fieldLabel}>Exchange Rate</Text>
            <TextInput
              style={styles.textInput}
              value={exchangeRate}
              onChangeText={setExchangeRate}
              keyboardType="decimal-pad"
              placeholder="1.0"
              placeholderTextColor={Colors.text.tertiary}
            />
          </Card>
        )}

        {/* Category */}
        {type !== 'TRANSFER' && (
          <Card style={styles.field}>
            <Text style={styles.fieldLabel}>Category (optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                <TouchableOpacity
                  style={[styles.chip, !categoryId && styles.chipSelected]}
                  onPress={() => setCategoryId('')}
                >
                  <Text style={Typography.labelMedium}>None</Text>
                </TouchableOpacity>
                {categoryState.categories.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.chip, { borderColor: c.colorHex }, categoryId === c.id && { backgroundColor: c.colorHex }]}
                    onPress={() => setCategoryId(c.id)}
                  >
                    <Text style={[Typography.labelMedium, { color: categoryId === c.id ? Colors.text.inverse : Colors.text.primary }]}>
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </Card>
        )}

        {/* Note */}
        <Card style={styles.field}>
          <Text style={styles.fieldLabel}>Note</Text>
          <TextInput
            style={[styles.textInput, styles.noteInput]}
            value={note}
            onChangeText={setNote}
            placeholder="Add a note..."
            placeholderTextColor={Colors.text.tertiary}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </Card>

        {/* Include in reports */}
        <Card style={[styles.field, styles.switchRow]}>
          <Text style={styles.switchLabel}>Include in reports</Text>
          <Switch
            value={isIncluded}
            onValueChange={setIsIncluded}
            trackColor={{ true: Colors.primary }}
          />
        </Card>

        {/* Save */}
        <Button
          label={editing ? 'Update Transaction' : 'Save Transaction'}
          onPress={handleSave}
          loading={isLoading}
          style={styles.saveButton}
        />
      </ScrollView>
    </View>
  );
}

const typeColors: Record<TransactionType, string> = {
  DEBIT: Colors.expense,
  CREDIT: Colors.income,
  TRANSFER: Colors.transfer,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, gap: Spacing.md, paddingBottom: Spacing['3xl'] },
  typeSelector: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.sm },
  typeButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    backgroundColor: Colors.surfaceVariant,
  },
  typeButtonActive: (type: TransactionType) => ({
    backgroundColor: typeColors[type],
  }),
  field: { gap: Spacing.sm },
  fieldLabel: { ...Typography.labelMedium, color: Colors.text.secondary },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  amountInput: {
    ...Typography.amountLarge,
    color: Colors.text.primary,
    flex: 1,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    paddingVertical: Spacing.sm,
  },
  currencyBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  currencyText: { ...Typography.labelLarge, color: Colors.primaryDark },
  chipRow: { flexDirection: 'row', gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  textInput: {
    ...Typography.bodyLarge,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  noteInput: { minHeight: 80 },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: { ...Typography.bodyLarge, color: Colors.text.primary },
  saveButton: { marginTop: Spacing.sm },
});
