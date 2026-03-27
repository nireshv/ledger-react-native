import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSettingStore } from '@features/settings/store/settingStore';
import { Card } from '@core/components/Card';
import { Colors, Typography, Spacing, BorderRadius } from '@core/theme';
import type { SettingEffect } from '@features/settings/store/settingStore';

function SettingRow({
  label,
  subtitle,
  right,
  onPress,
}: {
  label: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingLeft}>
        <Text style={styles.settingLabel}>{label}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {right}
    </TouchableOpacity>
  );
}

export function SettingScreen() {
  const { state, dispatch, onEffect } = useSettingStore();

  useEffect(() => {
    dispatch({ type: 'LOAD_SETTINGS' });
  }, []);

  useEffect(() => {
    const unsub = onEffect((effect: SettingEffect) => {
      if (effect.type === 'SHOW_SUCCESS') Alert.alert('Success', effect.message);
      if (effect.type === 'SHOW_ERROR') Alert.alert('Error', effect.message);
    });
    return unsub;
  }, [onEffect]);

  const handleExport = useCallback(() => {
    Alert.alert('Export Backup', 'Export all data to a JSON file?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Export', onPress: () => dispatch({ type: 'EXPORT_BACKUP' }) },
    ]);
  }, [dispatch]);

  const handleImport = useCallback(() => {
    Alert.alert(
      'Import Backup',
      'This will replace ALL existing data. Make sure you have a backup first.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Import', style: 'destructive', onPress: () => dispatch({ type: 'IMPORT_BACKUP' }) },
      ],
    );
  }, [dispatch]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.screenTitle}>Settings</Text>

      {/* Security */}
      <Text style={styles.sectionHeader}>Security</Text>
      <Card>
        <SettingRow
          label="Biometric Authentication"
          subtitle="Use Face ID / Fingerprint to unlock"
          right={
            <Switch
              value={state.biometricEnabled}
              onValueChange={(v) => dispatch({ type: 'TOGGLE_BIOMETRIC', enabled: v })}
              trackColor={{ true: Colors.primary }}
            />
          }
        />
      </Card>

      {/* Backup */}
      <Text style={styles.sectionHeader}>Backup & Restore</Text>
      <Card>
        <SettingRow
          label="Export Backup"
          subtitle="Save all data to a JSON file"
          right={
            state.backupInProgress
              ? <ActivityIndicator color={Colors.primary} />
              : <Text style={styles.chevron}>›</Text>
          }
          onPress={state.backupInProgress ? undefined : handleExport}
        />
        <View style={styles.divider} />
        <SettingRow
          label="Import Backup"
          subtitle="Restore data from a JSON backup file"
          right={
            state.restoreInProgress
              ? <ActivityIndicator color={Colors.primary} />
              : <Text style={styles.chevron}>›</Text>
          }
          onPress={state.restoreInProgress ? undefined : handleImport}
        />
      </Card>

      {/* About */}
      <Text style={styles.sectionHeader}>About</Text>
      <Card>
        <SettingRow
          label="Version"
          right={<Text style={styles.version}>1.0.0</Text>}
        />
        <View style={styles.divider} />
        <SettingRow
          label="Database"
          right={<Text style={styles.version}>ledger_database.db</Text>}
        />
      </Card>

      {/* Error */}
      {state.error && (
        <Text style={styles.errorText}>{state.error}</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, gap: Spacing.sm, paddingBottom: Spacing['3xl'] },
  screenTitle: { ...Typography.headlineLarge, color: Colors.text.primary, marginBottom: Spacing.sm },
  sectionHeader: {
    ...Typography.labelLarge,
    color: Colors.text.secondary,
    marginTop: Spacing.base,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  settingLeft: { flex: 1, paddingRight: Spacing.md },
  settingLabel: { ...Typography.bodyLarge, color: Colors.text.primary },
  settingSubtitle: { ...Typography.bodySmall, color: Colors.text.secondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.divider, marginVertical: Spacing.xs },
  chevron: { ...Typography.headlineSmall, color: Colors.text.tertiary },
  version: { ...Typography.bodyMedium, color: Colors.text.secondary },
  errorText: { ...Typography.bodyMedium, color: Colors.error, textAlign: 'center' },
});
