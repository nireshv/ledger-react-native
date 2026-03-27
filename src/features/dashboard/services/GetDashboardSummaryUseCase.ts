import type { ITransactionRepository } from '@features/transaction/services/ITransactionRepository';
import type { IAccountRepository } from '@features/account/services/IAccountRepository';
import type { Duration } from '@core/types/Duration';
import { MathUtils } from '@core/utils/MathUtils';

export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  currency: string;
  accountCount: number;
}

export class GetDashboardSummaryUseCase {
  constructor(
    private readonly transactionRepo: ITransactionRepository,
    private readonly accountRepo: IAccountRepository,
  ) {}

  async invoke(duration: Duration, currency: string): Promise<DashboardSummary> {
    const [creditTxs, debitTxs, accounts] = await Promise.all([
      this.transactionRepo.getByTypeAndDuration('CREDIT', duration),
      this.transactionRepo.getByTypeAndDuration('DEBIT', duration),
      this.accountRepo.getAll(),
    ]);

    const totalIncome = MathUtils.round(
      MathUtils.sum(
        creditTxs
          .filter((t) => t.currency === currency && t.isIncluded)
          .map((t) => t.amount),
      ),
      2,
    );

    const totalExpense = MathUtils.round(
      MathUtils.sum(
        debitTxs
          .filter((t) => t.currency === currency && t.isIncluded)
          .map((t) => t.amount),
      ),
      2,
    );

    return {
      totalIncome,
      totalExpense,
      netBalance: MathUtils.round(totalIncome - totalExpense, 2),
      currency,
      accountCount: accounts.length,
    };
  }
}
