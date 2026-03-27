import type { ITransactionRepository } from './ITransactionRepository';
import type { IAccountRepository } from '@features/account/services/IAccountRepository';

export class ToggleTransactionInclusionUseCase {
  constructor(
    private readonly transactionRepo: ITransactionRepository,
    private readonly accountRepo: IAccountRepository,
  ) {}

  async invoke(id: string, isIncluded: boolean): Promise<void> {
    const tx = await this.transactionRepo.getById(id);
    if (!tx || tx.isIncluded === isIncluded) return;

    await this.transactionRepo.toggleInclusion(id, isIncluded);

    // Adjust account balances based on inclusion change
    const sign = isIncluded ? 1 : -1;

    switch (tx.type) {
      case 'CREDIT': {
        const account = await this.accountRepo.getById(tx.accountId);
        if (account) {
          await this.accountRepo.updateBalance(tx.accountId, account.balance + sign * tx.amount);
        }
        break;
      }
      case 'DEBIT': {
        const account = await this.accountRepo.getById(tx.accountId);
        if (account) {
          await this.accountRepo.updateBalance(tx.accountId, account.balance - sign * tx.amount);
        }
        break;
      }
      case 'TRANSFER': {
        if (!tx.toAccountId) break;
        const [from, to] = await Promise.all([
          this.accountRepo.getById(tx.accountId),
          this.accountRepo.getById(tx.toAccountId),
        ]);
        if (from) {
          await this.accountRepo.updateBalance(tx.accountId, from.balance - sign * tx.amount);
        }
        if (to) {
          await this.accountRepo.updateBalance(
            tx.toAccountId,
            to.balance + sign * tx.amount * tx.exchangeRate,
          );
        }
        break;
      }
    }
  }
}
