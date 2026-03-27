import { useEffect } from 'react';
import { TransactionListScreen } from '@features/transaction/screens/TransactionListScreen';
import { useAccountStore } from '@features/account/store/accountStore';
import { useCategoryStore } from '@features/category/store/categoryStore';

export default function TransactionsTab() {
  // Pre-load accounts and categories so the transaction upsert screen has data
  const { dispatch: accountDispatch } = useAccountStore();
  const { dispatch: categoryDispatch } = useCategoryStore();

  useEffect(() => {
    accountDispatch({ type: 'LOAD_ACCOUNTS' });
    categoryDispatch({ type: 'LOAD_CATEGORIES' });
  }, []);

  return <TransactionListScreen />;
}
