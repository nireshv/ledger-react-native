import type { IAccountRepository } from './IAccountRepository';
import { MathUtils } from '@core/utils/MathUtils';

export interface BalanceByCurrency {
  currency: string;
  balance: number;
}

export class GetTotalBalanceUseCase {
  constructor(private readonly repo: IAccountRepository) {}

  /**
   * Returns the sum of balances per currency for all accounts flagged as
   * isIncludedInTotal. Multi-currency totals are returned as separate entries
   * (equivalent to Android's per-currency aggregation).
   */
  async invoke(): Promise<BalanceByCurrency[]> {
    const accounts = await this.repo.getAll();
    const included = accounts.filter((a) => a.isIncludedInTotal);

    const byCurrency: Record<string, number> = {};
    for (const account of included) {
      byCurrency[account.currency] =
        MathUtils.round((byCurrency[account.currency] ?? 0) + account.balance, 2);
    }

    return Object.entries(byCurrency).map(([currency, balance]) => ({
      currency,
      balance,
    }));
  }
}
