import { create } from 'zustand';
import type { Duration } from '@core/types/Duration';
import type { DashboardSummary } from '../services/GetDashboardSummaryUseCase';
import type { ChartDataPoint } from '../services/GetIncomeExpenseChartDataUseCase';
import type { CategorySpending } from '@features/category/services/GetCategorySpendingUseCase';
import { DateUtils } from '@core/utils/DateUtils';
import { ServiceLocator } from '@di/providers/ServiceLocator';
import type { ViewState } from '@core/mvi/EventContract';
import { createLogger } from '@core/utils/Logger';

const log = createLogger('dashboardStore');

interface DashboardState extends ViewState {
  duration: Duration;
  currency: string;
  summary: DashboardSummary | null;
  chartData: ChartDataPoint[];
  categoryBreakdown: CategorySpending[];
}

export type DashboardIntent =
  | { type: 'LOAD_DASHBOARD' }
  | { type: 'SET_DURATION'; duration: Duration }
  | { type: 'SET_CURRENCY'; currency: string }
  | { type: 'REFRESH' };

interface DashboardStore {
  state: DashboardState;
  dispatch: (intent: DashboardIntent) => Promise<void>;
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  state: {
    isLoading: false,
    error: null,
    duration: DateUtils.monthDuration(),
    currency: 'USD',
    summary: null,
    chartData: [],
    categoryBreakdown: [],
  },

  dispatch: async (intent) => {
    const sl = ServiceLocator.getInstance();

    switch (intent.type) {
      case 'LOAD_DASHBOARD':
      case 'REFRESH': {
        const { duration, currency } = get().state;
        set((s) => ({ state: { ...s.state, isLoading: true, error: null } }));
        try {
          const [summary, chartData, categoryBreakdown] = await Promise.all([
            sl.getDashboardSummaryUseCase.invoke(duration, currency),
            sl.getIncomeExpenseChartDataUseCase.invoke(duration, currency),
            sl.getCategorySpendingUseCase.invoke(duration, currency),
          ]);
          set((s) => ({
            state: { ...s.state, isLoading: false, summary, chartData, categoryBreakdown },
          }));
        } catch (e) {
          log.error('LOAD_DASHBOARD failed', e);
          set((s) => ({ state: { ...s.state, isLoading: false, error: String(e) } }));
        }
        break;
      }

      case 'SET_DURATION': {
        set((s) => ({ state: { ...s.state, duration: intent.duration } }));
        await get().dispatch({ type: 'LOAD_DASHBOARD' });
        break;
      }

      case 'SET_CURRENCY': {
        set((s) => ({ state: { ...s.state, currency: intent.currency } }));
        await get().dispatch({ type: 'LOAD_DASHBOARD' });
        break;
      }
    }
  },
}));
