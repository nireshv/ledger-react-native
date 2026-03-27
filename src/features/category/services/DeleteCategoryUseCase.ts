import type { ICategoryRepository } from './ICategoryRepository';

export class DeleteCategoryUseCase {
  constructor(private readonly repo: ICategoryRepository) {}

  async invoke(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
