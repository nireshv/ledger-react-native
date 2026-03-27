import type { ITransactionRepository } from './ITransactionRepository';
import type { IAccountRepository } from '@features/account/services/IAccountRepository';
import { createLogger } from '@core/utils/Logger';

const log = createLogger('DeleteTransactionUseCase');

export class DeleteTransactionUseCase {
  constructor(
    private readonly transactionRepo: ITransactionRepository,
    private readonly accountRepo: IAccountRepository,
  ) {}

  async invoke(id: string): Promise<void> {
    // Fetch transaction before deletion to reverse its balance effect
    const tx = await this.transactionRepo.getById(id);
    if (!tx) return;

    await this.transactionRepo.delete(id);

    if (!tx.isIncluded) {
      log.info('Deleted excluded transaction; no balance update needed', id);
      return;
    }

    // Reverse the balance effect
    switch (tx.type) {
      case 'CREDIT': {
        const account = await this.accountRepo.getById(tx.accountId);
        if (account) {
          await this.accountRepo.updateBalance(tx.accountId, account.balance - tx.amount);
        }
        break;
      }
      case 'DEBIT': {
        const account = await this.accountRepo.getById(tx.accountId);
        if (account) {
          await this.accountRepo.updateBalance(tx.accountId, account.balance + tx.amount);
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
          await this.accountRepo.updateBalance(tx.accountId, fromAccount.balance + tx.amount);
        }
        if (toAccount) {
          await this.accountRepo.updateBalance(
            tx.toAccountId,
            toAccount.balance - tx.amount * tx.exchangeRate,
          );
        }
        break;
      }
    }

    log.info('Transaction deleted and balances reversed', id);
  }
}
