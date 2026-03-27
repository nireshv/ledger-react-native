import { create } from 'zustand';
import type { Duration } from '@core/types/Duration';
import type { ReportEntry } from '../services/GetReportByCurrencyUseCase';
import { DateUtils } from '@core/utils/DateUtils';
import { ServiceLocator } from '@di/providers/ServiceLocator';
import type { ViewState } from '@core/mvi/EventContract';
import { createLogger } from '@core/utils/Logger';

const log = createLogger('reportStore');

interface ReportState extends ViewState {
  duration: Duration;
  entries: ReportEntry[];
}

export type ReportIntent =
  | { type: 'LOAD_REPORT' }
  | { type: 'SET_DURATION'; duration: Duration };

interface ReportStore {
  state: ReportState;
  dispatch: (intent: ReportIntent) => Promise<void>;
}

export const useReportStore = create<ReportStore>((set, get) => ({
  state: {
    isLoading: false,
    error: null,
    duration: DateUtils.monthDuration(),
    entries: [],
  },

  dispatch: async (intent) => {
    const sl = ServiceLocator.getInstance();

    switch (intent.type) {
      case 'LOAD_REPORT': {
        const { duration } = get().state;
        set((s) => ({ state: { ...s.state, isLoading: true, error: null } }));
        try {
          const entries = await sl.getReportByCurrencyUseCase.invoke(duration);
          set((s) => ({ state: { ...s.state, isLoading: false, entries } }));
        } catch (e) {
          log.error('LOAD_REPORT failed', e);
          set((s) => ({ state: { ...s.state, isLoading: false, error: String(e) } }));
        }
        break;
      }

      case 'SET_DURATION': {
        set((s) => ({ state: { ...s.state, duration: intent.duration } }));
        await get().dispatch({ type: 'LOAD_REPORT' });
        break;
      }
    }
  },
}));
