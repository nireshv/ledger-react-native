export interface AccountEntity {
  id: string;
  name: string;
  currency: string;
  balance: number;
  color_hex: string;
  is_included_in_total: number;  // 0 | 1
  created_at: string;
}
