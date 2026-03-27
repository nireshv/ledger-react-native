import type { Category, CategoryInput } from '../types/Category';
import type { CategoryEntity } from './CategoryEntity';

export class CategoryMapper {
  static toDomain(entity: CategoryEntity): Category {
    return {
      id: entity.id,
      name: entity.name,
      colorHex: entity.color_hex,
      iconName: entity.icon_name,
      createdAt: new Date(entity.created_at),
    };
  }

  static toEntity(domain: CategoryInput): CategoryEntity {
    return {
      id: domain.id,
      name: domain.name,
      color_hex: domain.colorHex,
      icon_name: domain.iconName ?? null,
      created_at: new Date().toISOString(),
    };
  }
}
