import { create } from 'zustand';
import type { Transaction, TransactionInput } from '../types/Transaction';
import type { Duration } from '@core/types/Duration';
import { DateUtils } from '@core/utils/DateUtils';
import { ServiceLocator } from '@di/providers/ServiceLocator';
import type { ViewState, EffectListener, Unsubscribe } from '@core/mvi/EventContract';
import { createLogger } from '@core/utils/Logger';

const log = createLogger('transactionStore');

// ─── State (equivalent to Android's UiState data class) ──────────────────────

interface TransactionState extends ViewState {
  transactions: Transaction[];
  selectedTransaction: Transaction | null;
  filterDuration: Duration;
  filterAccountId: string | null;
  filterCategoryId: string | null;
  searchQuery: string;
}

// ─── Intents (equivalent to Android's sealed Intent class) ───────────────────

export type TransactionIntent =
  | { type: 'LOAD_TRANSACTIONS' }
  | { type: 'LOAD_BY_DURATION'; duration: Duration }
  | { type: 'SELECT_TRANSACTION'; id: string }
  | { type: 'CLEAR_SELECTED' }
  | { type: 'UPSERT_TRANSACTION'; transaction: TransactionInput }
  | { type: 'DELETE_TRANSACTION'; id: string }
  | { type: 'TOGGLE_INCLUSION'; id: string; isIncluded: boolean }
  | { type: 'SET_FILTER_ACCOUNT'; accountId: string | null }
  | { type: 'SET_FILTER_CATEGORY'; categoryId: string | null }
  | { type: 'SET_SEARCH_QUERY'; query: string }
  | { type: 'CLEAR_ERROR' };

// ─── Effects (one-shot side effects) ─────────────────────────────────────────

export type TransactionEffect =
  | { type: 'NAVIGATE_BACK' }
  | { type: 'SHOW_SUCCESS'; message: string }
  | { type: 'SHOW_ERROR'; message: string };

// ─── Store ───────────────────────────────────────────────────────────────────

interface TransactionStore {
  state: TransactionState;
  dispatch: (intent: TransactionIntent) => Promise<void>;
  onEffect: (listener: EffectListener<TransactionEffect>) => Unsubscribe;
  _emitEffect: (effect: TransactionEffect) => void;
  _effectListeners: EffectListener<TransactionEffect>[];
}

const initialState: TransactionState = {
  isLoading: false,
  error: null,
  transactions: [],
  selectedTransaction: null,
  filterDuration: DateUtils.monthDuration(),
  filterAccountId: null,
  filterCategoryId: null,
  searchQuery: '',
};

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  state: initialState,
  _effectListeners: [],

  _emitEffect: (effect) => {
    get()._effectListeners.forEach((l) => l(effect));
  },

  onEffect: (listener) => {
    set((s) => ({ _effectListeners: [...s._effectListeners, listener] }));
    return () =>
      set((s) => ({
        _effectListeners: s._effectListeners.filter((l) => l !== listener),
      }));
  },

  dispatch: async (intent) => {
    const sl = ServiceLocator.getInstance();
    const emit = get()._emitEffect;

    switch (intent.type) {
      case 'LOAD_TRANSACTIONS': {
        set((s) => ({ state: { ...s.state, isLoading: true, error: null } }));
        try {
          const { filterDuration, filterAccountId, filterCategoryId, searchQuery } =
            get().state;

          let transactions: Transaction[];

          if (searchQuery.trim()) {
            transactions = await sl.searchTransactionsUseCase.invoke(searchQuery);
          } else if (filterAccountId) {
            transactions = await sl.getTransactionsByAccountUseCase.invoke(
              filterAccountId,
              filterDuration,
            );
          } else if (filterCategoryId) {
            transactions = await sl.getTransactionsByCategoryUseCase.invoke(
              filterCategoryId,
              filterDuration,
            );
          } else {
            transactions = await sl.getTransactionsByDurationUseCase.invoke(filterDuration);
          }

          set((s) => ({ state: { ...s.state, isLoading: false, transactions } }));
        } catch (e) {
          log.error('LOAD_TRANSACTIONS failed', e);
          set((s) => ({ state: { ...s.state, isLoading: false, error: String(e) } }));
        }
        break;
      }

      case 'LOAD_BY_DURATION': {
        set((s) => ({
          state: { ...s.state, filterDuration: intent.duration },
        }));
        await get().dispatch({ type: 'LOAD_TRANSACTIONS' });
        break;
      }

      case 'SELECT_TRANSACTION': {
        set((s) => ({ state: { ...s.state, isLoading: true } }));
        try {
          const tx = await sl.getTransactionByIdUseCase.invoke(intent.id);
          set((s) => ({ state: { ...s.state, isLoading: false, selectedTransaction: tx } }));
        } catch (e) {
          set((s) => ({ state: { ...s.state, isLoading: false } }));
        }
        break;
      }

      case 'CLEAR_SELECTED': {
        set((s) => ({ state: { ...s.state, selectedTransaction: null } }));
        break;
      }

      case 'UPSERT_TRANSACTION': {
        set((s) => ({ state: { ...s.state, isLoading: true, error: null } }));
        try {
          await sl.upsertTransactionUseCase.invoke(intent.transaction);
          await get().dispatch({ type: 'LOAD_TRANSACTIONS' });
          emit({ type: 'NAVIGATE_BACK' });
          emit({ type: 'SHOW_SUCCESS', message: 'Transaction saved' });
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          log.error('UPSERT_TRANSACTION failed', e);
          set((s) => ({ state: { ...s.state, isLoading: false, error: message } }));
          emit({ type: 'SHOW_ERROR', message });
        }
        break;
      }

      case 'DELETE_TRANSACTION': {
        set((s) => ({ state: { ...s.state, isLoading: true } }));
        try {
          await sl.deleteTransactionUseCase.invoke(intent.id);
          await get().dispatch({ type: 'LOAD_TRANSACTIONS' });
          emit({ type: 'SHOW_SUCCESS', message: 'Transaction deleted' });
        } catch (e) {
          log.error('DELETE_TRANSACTION failed', e);
          set((s) => ({ state: { ...s.state, isLoading: false, error: String(e) } }));
        }
        break;
      }

      case 'TOGGLE_INCLUSION': {
        try {
          await sl.toggleTransactionInclusionUseCase.invoke(intent.id, intent.isIncluded);
          await get().dispatch({ type: 'LOAD_TRANSACTIONS' });
        } catch (e) {
          log.error('TOGGLE_INCLUSION failed', e);
        }
        break;
      }

      case 'SET_FILTER_ACCOUNT': {
        set((s) => ({ state: { ...s.state, filterAccountId: intent.accountId } }));
        await get().dispatch({ type: 'LOAD_TRANSACTIONS' });
        break;
      }

      case 'SET_FILTER_CATEGORY': {
        set((s) => ({ state: { ...s.state, filterCategoryId: intent.categoryId } }));
        await get().dispatch({ type: 'LOAD_TRANSACTIONS' });
        break;
      }

      case 'SET_SEARCH_QUERY': {
        set((s) => ({ state: { ...s.state, searchQuery: intent.query } }));
        await get().dispatch({ type: 'LOAD_TRANSACTIONS' });
        break;
      }

      case 'CLEAR_ERROR': {
        set((s) => ({ state: { ...s.state, error: null } }));
        break;
      }
    }
  },
}));
