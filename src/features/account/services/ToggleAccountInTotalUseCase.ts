import type { IAccountRepository } from './IAccountRepository';

export class ToggleAccountInTotalUseCase {
  constructor(private readonly repo: IAccountRepository) {}

  async invoke(id: string, included: boolean): Promise<void> {
    await this.repo.toggleIncludedInTotal(id, included);
  }
}
