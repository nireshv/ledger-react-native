import type { ITransactionRepository } from './ITransactionRepository';
import type { IAccountRepository } from '@features/account/services/IAccountRepository';
import { TransactionInputSchema, type TransactionInput } from '../types/Transaction';
import { createLogger } from '@core/utils/Logger';

const log = createLogger('UpsertTransactionUseCase');

/**
 * UpsertTransactionUseCase — validates, persists a transaction, and
 * updates affected account balances. Equivalent to Android's single-responsibility use case.
 */
export class UpsertTransactionUseCase {
  constructor(
    private readonly transactionRepo: ITransactionRepository,
    private readonly accountRepo: IAccountRepository,
  ) {}

  async invoke(input: TransactionInput): Promise<void> {
    // 1. Validate input at the domain boundary (Zod)
    const validated = TransactionInputSchema.parse(input);

    // 2. Retrieve the existing transaction (if updating) to reverse its balance effect
    const existing = await this.transactionRepo.getById(validated.id);

    // 3. Persist the transaction
    await this.transactionRepo.upsert(validated);

    // 4. Recalculate balances
    await this._recalculateBalances(validated, existing ?? null);

    log.info('Transaction upserted', validated.id);
  }

  private async _recalculateBalances(
    next: TransactionInput,
    prev: TransactionInput | null,
  ): Promise<void> {
    if (prev) {
      // Reverse previous effect
      await this._applyBalance(prev, true);
    }
    // Apply new effect
    await this._applyBalance(next, false);
  }

  private async _applyBalance(tx: TransactionInput, reverse: boolean): Promise<void> {
    if (!tx.isIncluded) return;

    const sign = reverse ? -1 : 1;

    switch (tx.type) {
      case 'CREDIT': {
        const account = await this.accountRepo.getById(tx.accountId);
        if (account) {
          await this.accountRepo.updateBalance(
            tx.accountId,
            account.balance + sign * tx.amount,
          );
        }
        break;
      }
      case 'DEBIT': {
        const account = await this.accountRepo.getById(tx.accountId);
        if (account) {
          await this.accountRepo.updateBalance(
            tx.accountId,
            account.balance - sign * tx.amount,
          );
        }
        break;
      }
      case 'TRANSFER': {
        if (!tx.toAccountId) break;
        const [fromAccount, toAccount] = await Promise.all([
          this.accountRepo.getById(tx.accountId),
          this.accountRepo.getById(tx.toAccountId),
        ]);
        if (fromAccount) {
          await this.accountRepo.updateBalance(
            tx.accountId,
            fromAccount.balance - sign * tx.amount,
          );
        }
        if (toAccount) {
          // toAccount receives amount × exchangeRate (cross-currency support)
          await this.accountRepo.updateBalance(
            tx.toAccountId,
            toAccount.balance + sign * tx.amount * tx.exchangeRate,
          );
        }
        break;
      }
    }
  }
}
