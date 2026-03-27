import { create } from 'zustand';
import type { Category, CategoryInput } from '../types/Category';
import { ServiceLocator } from '@di/providers/ServiceLocator';
import type { ViewState, EffectListener, Unsubscribe } from '@core/mvi/EventContract';
import { createLogger } from '@core/utils/Logger';

const log = createLogger('categoryStore');

interface CategoryState extends ViewState {
  categories: Category[];
  selectedCategory: Category | null;
}

export type CategoryIntent =
  | { type: 'LOAD_CATEGORIES' }
  | { type: 'SELECT_CATEGORY'; id: string }
  | { type: 'CLEAR_SELECTED' }
  | { type: 'UPSERT_CATEGORY'; category: CategoryInput }
  | { type: 'DELETE_CATEGORY'; id: string }
  | { type: 'CLEAR_ERROR' };

export type CategoryEffect =
  | { type: 'NAVIGATE_BACK' }
  | { type: 'SHOW_SUCCESS'; message: string }
  | { type: 'SHOW_ERROR'; message: string };

interface CategoryStore {
  state: CategoryState;
  dispatch: (intent: CategoryIntent) => Promise<void>;
  onEffect: (listener: EffectListener<CategoryEffect>) => Unsubscribe;
  _emitEffect: (effect: CategoryEffect) => void;
  _effectListeners: EffectListener<CategoryEffect>[];
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  state: { isLoading: false, error: null, categories: [], selectedCategory: null },
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
      case 'LOAD_CATEGORIES': {
        set((s) => ({ state: { ...s.state, isLoading: true, error: null } }));
        try {
          const categories = await sl.getCategoriesUseCase.invoke();
          set((s) => ({ state: { ...s.state, isLoading: false, categories } }));
        } catch (e) {
          log.error('LOAD_CATEGORIES failed', e);
          set((s) => ({ state: { ...s.state, isLoading: false, error: String(e) } }));
        }
        break;
      }

      case 'SELECT_CATEGORY': {
        const category = await sl.getCategoryByIdUseCase.invoke(intent.id);
        set((s) => ({ state: { ...s.state, selectedCategory: category } }));
        break;
      }

      case 'CLEAR_SELECTED': {
        set((s) => ({ state: { ...s.state, selectedCategory: null } }));
        break;
      }

      case 'UPSERT_CATEGORY': {
        set((s) => ({ state: { ...s.state, isLoading: true } }));
        try {
          await sl.upsertCategoryUseCase.invoke(intent.category);
          await get().dispatch({ type: 'LOAD_CATEGORIES' });
          emit({ type: 'NAVIGATE_BACK' });
          emit({ type: 'SHOW_SUCCESS', message: 'Category saved' });
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          log.error('UPSERT_CATEGORY failed', e);
          set((s) => ({ state: { ...s.state, isLoading: false, error: message } }));
          emit({ type: 'SHOW_ERROR', message });
        }
        break;
      }

      case 'DELETE_CATEGORY': {
        set((s) => ({ state: { ...s.state, isLoading: true } }));
        try {
          await sl.deleteCategoryUseCase.invoke(intent.id);
          await get().dispatch({ type: 'LOAD_CATEGORIES' });
          emit({ type: 'SHOW_SUCCESS', message: 'Category deleted' });
        } catch (e) {
          log.error('DELETE_CATEGORY failed', e);
          set((s) => ({ state: { ...s.state, isLoading: false, error: String(e) } }));
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
