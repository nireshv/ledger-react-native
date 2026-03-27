import type { ICategoryRepository } from './ICategoryRepository';
import type { Category } from '../types/Category';

export class GetCategoriesUseCase {
  constructor(private readonly repo: ICategoryRepository) {}

  async invoke(): Promise<Category[]> {
    return this.repo.getAll();
  }
}
