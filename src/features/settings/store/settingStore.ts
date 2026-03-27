import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { ServiceLocator } from '@di/providers/ServiceLocator';
import type { ViewState, EffectListener, Unsubscribe } from '@core/mvi/EventContract';
import { createLogger } from '@core/utils/Logger';

const log = createLogger('settingStore');

const KEYS = { BIOMETRIC: 'biometric_enabled', DEFAULT_CURRENCY: 'default_currency' };

interface SettingState extends ViewState {
  biometricEnabled: boolean;
  defaultCurrency: string;
  backupInProgress: boolean;
  restoreInProgress: boolean;
}

export type SettingIntent =
  | { type: 'LOAD_SETTINGS' }
  | { type: 'TOGGLE_BIOMETRIC'; enabled: boolean }
  | { type: 'SET_DEFAULT_CURRENCY'; currency: string }
  | { type: 'EXPORT_BACKUP' }
  | { type: 'IMPORT_BACKUP' };

export type SettingEffect =
  | { type: 'SHOW_SUCCESS'; message: string }
  | { type: 'SHOW_ERROR'; message: string };

interface SettingStore {
  state: SettingState;
  dispatch: (intent: SettingIntent) => Promise<void>;
  onEffect: (listener: EffectListener<SettingEffect>) => Unsubscribe;
  _emitEffect: (effect: SettingEffect) => void;
  _effectListeners: EffectListener<SettingEffect>[];
}

export const useSettingStore = create<SettingStore>((set, get) => ({
  state: {
    isLoading: false,
    error: null,
    biometricEnabled: false,
    defaultCurrency: 'USD',
    backupInProgress: false,
    restoreInProgress: false,
  },
  _effectListeners: [],

  _emitEffect: (effect) => get()._effectListeners.forEach((l) => l(effect)),

  onEffect: (listener) => {
    set((s) => ({ _effectListeners: [...s._effectListeners, listener] }));
    return () => set((s) => ({ _effectListeners: s._effectListeners.filter((l) => l !== listener) }));
  },

  dispatch: async (intent) => {
    const sl = ServiceLocator.getInstance();
    const emit = get()._emitEffect;

    switch (intent.type) {
      case 'LOAD_SETTINGS': {
        try {
          const [biometric, currency] = await Promise.all([
            SecureStore.getItemAsync(KEYS.BIOMETRIC),
            SecureStore.getItemAsync(KEYS.DEFAULT_CURRENCY),
          ]);
          set((s) => ({
            state: {
              ...s.state,
              biometricEnabled: biometric === 'true',
              defaultCurrency: currency ?? 'USD',
            },
          }));
        } catch (e) {
          log.error('LOAD_SETTINGS failed', e);
        }
        break;
      }

      case 'TOGGLE_BIOMETRIC': {
        await SecureStore.setItemAsync(KEYS.BIOMETRIC, String(intent.enabled));
        set((s) => ({ state: { ...s.state, biometricEnabled: intent.enabled } }));
        emit({ type: 'SHOW_SUCCESS', message: `Biometric auth ${intent.enabled ? 'enabled' : 'disabled'}` });
        break;
      }

      case 'SET_DEFAULT_CURRENCY': {
        await SecureStore.setItemAsync(KEYS.DEFAULT_CURRENCY, intent.currency);
        set((s) => ({ state: { ...s.state, defaultCurrency: intent.currency } }));
        break;
      }

      case 'EXPORT_BACKUP': {
        set((s) => ({ state: { ...s.state, backupInProgress: true } }));
        try {
          const uri = await sl.exportBackupUseCase.invoke();
          const canShare = await Sharing.isAvailableAsync();
          if (canShare) {
            await Sharing.shareAsync(uri, { mimeType: 'application/json' });
          }
          emit({ type: 'SHOW_SUCCESS', message: 'Backup exported successfully' });
        } catch (e) {
          const message = e instanceof Error ? e.message : 'Export failed';
          log.error('EXPORT_BACKUP failed', e);
          emit({ type: 'SHOW_ERROR', message });
        } finally {
          set((s) => ({ state: { ...s.state, backupInProgress: false } }));
        }
        break;
      }

      case 'IMPORT_BACKUP': {
        set((s) => ({ state: { ...s.state, restoreInProgress: true } }));
        try {
          const result = await DocumentPicker.getDocumentAsync({
            type: 'application/json',
            copyToCacheDirectory: true,
          });
          if (!result.canceled && result.assets[0]) {
            await sl.importBackupUseCase.invoke(result.assets[0].uri);
            emit({ type: 'SHOW_SUCCESS', message: 'Backup restored. Please restart the app.' });
          }
        } catch (e) {
          const message = e instanceof Error ? e.message : 'Restore failed';
          log.error('IMPORT_BACKUP failed', e);
          emit({ type: 'SHOW_ERROR', message });
        } finally {
          set((s) => ({ state: { ...s.state, restoreInProgress: false } }));
        }
        break;
      }
    }
  },
}));
