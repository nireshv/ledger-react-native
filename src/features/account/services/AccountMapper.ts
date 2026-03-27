import type { Account, AccountInput } from '../types/Account';
import type { AccountEntity } from './AccountEntity';

export class AccountMapper {
  static toDomain(entity: AccountEntity): Account {
    return {
      id: entity.id,
      name: entity.name,
      currency: entity.currency,
      balance: entity.balance,
      colorHex: entity.color_hex,
      isIncludedInTotal: entity.is_included_in_total === 1,
      createdAt: new Date(entity.created_at),
    };
  }

  static toEntity(domain: AccountInput): AccountEntity {
    return {
      id: domain.id,
      name: domain.name,
      currency: domain.currency,
      balance: domain.balance,
      color_hex: domain.colorHex,
      is_included_in_total: domain.isIncludedInTotal ? 1 : 0,
      created_at: new Date().toISOString(),
    };
  }
}
