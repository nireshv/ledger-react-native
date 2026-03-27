import { create } from 'zustand';
import type { Account, AccountInput } from '../types/Account';
import { ServiceLocator } from '@di/providers/ServiceLocator';
import type { ViewState, EffectListener, Unsubscribe } from '@core/mvi/EventContract';
import type { BalanceByCurrency } from '../services/GetTotalBalanceUseCase';
import { createLogger } from '@core/utils/Logger';

const log = createLogger('accountStore');

interface AccountState extends ViewState {
  accounts: Account[];
  selectedAccount: Account | null;
  totalBalances: BalanceByCurrency[];
}

export type AccountIntent =
  | { type: 'LOAD_ACCOUNTS' }
  | { type: 'SELECT_ACCOUNT'; id: string }
  | { type: 'CLEAR_SELECTED' }
  | { type: 'UPSERT_ACCOUNT'; account: AccountInput }
  | { type: 'DELETE_ACCOUNT'; id: string }
  | { type: 'TOGGLE_IN_TOTAL'; id: string; included: boolean }
  | { type: 'CLEAR_ERROR' };

export type AccountEffect =
  | { type: 'NAVIGATE_BACK' }
  | { type: 'SHOW_SUCCESS'; message: string }
  | { type: 'SHOW_ERROR'; message: string };

interface AccountStore {
  state: AccountState;
  dispatch: (intent: AccountIntent) => Promise<void>;
  onEffect: (listener: EffectListener<AccountEffect>) => Unsubscribe;
  _emitEffect: (effect: AccountEffect) => void;
  _effectListeners: EffectListener<AccountEffect>[];
}

export const useAccountStore = create<AccountStore>((set, get) => ({
  state: { isLoading: false, error: null, accounts: [], selectedAccount: null, totalBalances: [] },
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
      case 'LOAD_ACCOUNTS': {
        set((s) => ({ state: { ...s.state, isLoading: true, error: null } }));
        try {
          const [accounts, totalBalances] = await Promise.all([
            sl.getAccountsUseCase.invoke(),
            sl.getTotalBalanceUseCase.invoke(),
          ]);
          set((s) => ({ state: { ...s.state, isLoading: false, accounts, totalBalances } }));
        } catch (e) {
          log.error('LOAD_ACCOUNTS failed', e);
          set((s) => ({ state: { ...s.state, isLoading: false, error: String(e) } }));
        }
        break;
      }

      case 'SELECT_ACCOUNT': {
        const account = await sl.getAccountByIdUseCase.invoke(intent.id);
        set((s) => ({ state: { ...s.state, selectedAccount: account } }));
        break;
      }

      case 'CLEAR_SELECTED': {
        set((s) => ({ state: { ...s.state, selectedAccount: null } }));
        break;
      }

      case 'UPSERT_ACCOUNT': {
        set((s) => ({ state: { ...s.state, isLoading: true } }));
        try {
          await sl.upsertAccountUseCase.invoke(intent.account);
          await get().dispatch({ type: 'LOAD_ACCOUNTS' });
          emit({ type: 'NAVIGATE_BACK' });
          emit({ type: 'SHOW_SUCCESS', message: 'Account saved' });
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          log.error('UPSERT_ACCOUNT failed', e);
          set((s) => ({ state: { ...s.state, isLoading: false, error: message } }));
          emit({ type: 'SHOW_ERROR', message });
        }
        break;
      }

      case 'DELETE_ACCOUNT': {
        set((s) => ({ state: { ...s.state, isLoading: true } }));
        try {
          await sl.deleteAccountUseCase.invoke(intent.id);
          await get().dispatch({ type: 'LOAD_ACCOUNTS' });
          emit({ type: 'SHOW_SUCCESS', message: 'Account deleted' });
        } catch (e) {
          log.error('DELETE_ACCOUNT failed', e);
          set((s) => ({ state: { ...s.state, isLoading: false, error: String(e) } }));
        }
        break;
      }

      case 'TOGGLE_IN_TOTAL': {
        try {
          await sl.toggleAccountInTotalUseCase.invoke(intent.id, intent.included);
          await get().dispatch({ type: 'LOAD_ACCOUNTS' });
        } catch (e) {
          log.error('TOGGLE_IN_TOTAL failed', e);
        }
        break;
      }

      case 'CLEAR_ERROR': {
        set((s) => ({ state: { ...s.state, error: null } }));
        break;
      }
    }
  },
}));
