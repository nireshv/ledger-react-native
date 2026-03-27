import type { IAccountRepository } from './IAccountRepository';
import type { ITransactionRepository } from '@features/transaction/services/ITransactionRepository';
import { createLogger } from '@core/utils/Logger';

const log = createLogger('DeleteAccountUseCase');

/**
 * Deletes an account and all associated transactions (via CASCADE in SQLite).
 * Re-calculates balances of any linked transfer destination accounts.
 */
export class DeleteAccountUseCase {
  constructor(
    private readonly accountRepo: IAccountRepository,
    private readonly transactionRepo: ITransactionRepository,
  ) {}

  async invoke(id: string): Promise<void> {
    // Cascade delete is handled by SQLite FK constraint
    await this.accountRepo.delete(id);
    log.info('Account and all transactions deleted', id);
  }
}
