import type { SQLiteDatabase } from 'expo-sqlite';

// DAOs
import { TransactionDao } from '@features/transaction/services/TransactionDao';
import { AccountDao } from '@features/account/services/AccountDao';
import { CategoryDao } from '@features/category/services/CategoryDao';

// Repository implementations
import { TransactionRepositoryImpl } from '@features/transaction/services/TransactionRepositoryImpl';
import { AccountRepositoryImpl } from '@features/account/services/AccountRepositoryImpl';
import { CategoryRepositoryImpl } from '@features/category/services/CategoryRepositoryImpl';
import { BackupRepositoryImpl } from '@features/settings/services/BackupRepositoryImpl';

// Use cases — Transaction
import { GetTransactionsUseCase } from '@features/transaction/services/GetTransactionsUseCase';
import { GetTransactionByIdUseCase } from '@features/transaction/services/GetTransactionByIdUseCase';
import { GetTransactionsByDurationUseCase } from '@features/transaction/services/GetTransactionsByDurationUseCase';
import { GetTransactionsByAccountUseCase } from '@features/transaction/services/GetTransactionsByAccountUseCase';
import { GetTransactionsByCategoryUseCase } from '@features/transaction/services/GetTransactionsByCategoryUseCase';
import { SearchTransactionsUseCase } from '@features/transaction/services/SearchTransactionsUseCase';
import { UpsertTransactionUseCase } from '@features/transaction/services/UpsertTransactionUseCase';
import { DeleteTransactionUseCase } from '@features/transaction/services/DeleteTransactionUseCase';
import { ToggleTransactionInclusionUseCase } from '@features/transaction/services/ToggleTransactionInclusionUseCase';

// Use cases — Account
import { GetAccountsUseCase } from '@features/account/services/GetAccountsUseCase';
import { GetAccountByIdUseCase } from '@features/account/services/GetAccountByIdUseCase';
import { UpsertAccountUseCase } from '@features/account/services/UpsertAccountUseCase';
import { DeleteAccountUseCase } from '@features/account/services/DeleteAccountUseCase';
import { GetTotalBalanceUseCase } from '@features/account/services/GetTotalBalanceUseCase';
import { ToggleAccountInTotalUseCase } from '@features/account/services/ToggleAccountInTotalUseCase';

// Use cases — Category
import { GetCategoriesUseCase } from '@features/category/services/GetCategoriesUseCase';
import { GetCategoryByIdUseCase } from '@features/category/services/GetCategoryByIdUseCase';
import { UpsertCategoryUseCase } from '@features/category/services/UpsertCategoryUseCase';
import { DeleteCategoryUseCase } from '@features/category/services/DeleteCategoryUseCase';
import { GetCategorySpendingUseCase } from '@features/category/services/GetCategorySpendingUseCase';

// Use cases — Dashboard
import { GetDashboardSummaryUseCase } from '@features/dashboard/services/GetDashboardSummaryUseCase';
import { GetIncomeExpenseChartDataUseCase } from '@features/dashboard/services/GetIncomeExpenseChartDataUseCase';

// Use cases — Report
import { GetReportByCurrencyUseCase } from '@features/report/services/GetReportByCurrencyUseCase';

// Use cases — Backup
import { ExportBackupUseCase } from '@features/settings/services/ExportBackupUseCase';
import { ImportBackupUseCase } from '@features/settings/services/ImportBackupUseCase';

/**
 * ServiceLocator — manual DI container equivalent to Hilt.
 *
 * Initialized once at app startup after the database is open.
 * All use cases are singleton instances wired with their dependencies.
 *
 * Usage:
 *   ServiceLocator.initialize(db);          // in app/_layout.tsx after DB init
 *   const sl = ServiceLocator.getInstance(); // in stores
 */
export class ServiceLocator {
  private static _instance: ServiceLocator | null = null;

  // ─── Transaction use cases ───────────────────────────────────────────────
  readonly getTransactionsUseCase: GetTransactionsUseCase;
  readonly getTransactionByIdUseCase: GetTransactionByIdUseCase;
  readonly getTransactionsByDurationUseCase: GetTransactionsByDurationUseCase;
  readonly getTransactionsByAccountUseCase: GetTransactionsByAccountUseCase;
  readonly getTransactionsByCategoryUseCase: GetTransactionsByCategoryUseCase;
  readonly searchTransactionsUseCase: SearchTransactionsUseCase;
  readonly upsertTransactionUseCase: UpsertTransactionUseCase;
  readonly deleteTransactionUseCase: DeleteTransactionUseCase;
  readonly toggleTransactionInclusionUseCase: ToggleTransactionInclusionUseCase;

  // ─── Account use cases ───────────────────────────────────────────────────
  readonly getAccountsUseCase: GetAccountsUseCase;
  readonly getAccountByIdUseCase: GetAccountByIdUseCase;
  readonly upsertAccountUseCase: UpsertAccountUseCase;
  readonly deleteAccountUseCase: DeleteAccountUseCase;
  readonly getTotalBalanceUseCase: GetTotalBalanceUseCase;
  readonly toggleAccountInTotalUseCase: ToggleAccountInTotalUseCase;

  // ─── Category use cases ──────────────────────────────────────────────────
  readonly getCategoriesUseCase: GetCategoriesUseCase;
  readonly getCategoryByIdUseCase: GetCategoryByIdUseCase;
  readonly upsertCategoryUseCase: UpsertCategoryUseCase;
  readonly deleteCategoryUseCase: DeleteCategoryUseCase;
  readonly getCategorySpendingUseCase: GetCategorySpendingUseCase;

  // ─── Dashboard use cases ─────────────────────────────────────────────────
  readonly getDashboardSummaryUseCase: GetDashboardSummaryUseCase;
  readonly getIncomeExpenseChartDataUseCase: GetIncomeExpenseChartDataUseCase;

  // ─── Report use cases ────────────────────────────────────────────────────
  readonly getReportByCurrencyUseCase: GetReportByCurrencyUseCase;

  // ─── Backup use cases ────────────────────────────────────────────────────
  readonly exportBackupUseCase: ExportBackupUseCase;
  readonly importBackupUseCase: ImportBackupUseCase;

  private constructor(db: SQLiteDatabase) {
    // ── Build DAOs (equivalent to Room DAO injection)
    const transactionDao = new TransactionDao(db);
    const accountDao = new AccountDao(db);
    const categoryDao = new CategoryDao(db);

    // ── Build repositories (domain interfaces ← data implementations)
    const transactionRepo = new TransactionRepositoryImpl(transactionDao);
    const accountRepo = new AccountRepositoryImpl(accountDao);
    const categoryRepo = new CategoryRepositoryImpl(categoryDao);
    const backupRepo = new BackupRepositoryImpl(db);

    // ── Wire transaction use cases
    this.getTransactionsUseCase = new GetTransactionsUseCase(transactionRepo);
    this.getTransactionByIdUseCase = new GetTransactionByIdUseCase(transactionRepo);
    this.getTransactionsByDurationUseCase = new GetTransactionsByDurationUseCase(transactionRepo);
    this.getTransactionsByAccountUseCase = new GetTransactionsByAccountUseCase(transactionRepo);
    this.getTransactionsByCategoryUseCase = new GetTransactionsByCategoryUseCase(transactionRepo);
    this.searchTransactionsUseCase = new SearchTransactionsUseCase(transactionRepo);
    this.upsertTransactionUseCase = new UpsertTransactionUseCase(transactionRepo, accountRepo);
    this.deleteTransactionUseCase = new DeleteTransactionUseCase(transactionRepo, accountRepo);
    this.toggleTransactionInclusionUseCase = new ToggleTransactionInclusionUseCase(
      transactionRepo,
      accountRepo,
    );

    // ── Wire account use cases
    this.getAccountsUseCase = new GetAccountsUseCase(accountRepo);
    this.getAccountByIdUseCase = new GetAccountByIdUseCase(accountRepo);
    this.upsertAccountUseCase = new UpsertAccountUseCase(accountRepo);
    this.deleteAccountUseCase = new DeleteAccountUseCase(accountRepo, transactionRepo);
    this.getTotalBalanceUseCase = new GetTotalBalanceUseCase(accountRepo);
    this.toggleAccountInTotalUseCase = new ToggleAccountInTotalUseCase(accountRepo);

    // ── Wire category use cases
    this.getCategoriesUseCase = new GetCategoriesUseCase(categoryRepo);
    this.getCategoryByIdUseCase = new GetCategoryByIdUseCase(categoryRepo);
    this.upsertCategoryUseCase = new UpsertCategoryUseCase(categoryRepo);
    this.deleteCategoryUseCase = new DeleteCategoryUseCase(categoryRepo);
    this.getCategorySpendingUseCase = new GetCategorySpendingUseCase(transactionRepo, categoryRepo);

    // ── Wire dashboard use cases
    this.getDashboardSummaryUseCase = new GetDashboardSummaryUseCase(transactionRepo, accountRepo);
    this.getIncomeExpenseChartDataUseCase = new GetIncomeExpenseChartDataUseCase(transactionRepo);

    // ── Wire report use cases
    this.getReportByCurrencyUseCase = new GetReportByCurrencyUseCase(transactionRepo);

    // ── Wire backup use cases
    this.exportBackupUseCase = new ExportBackupUseCase(backupRepo);
    this.importBackupUseCase = new ImportBackupUseCase(backupRepo);
  }

  /** Called once from app/_layout.tsx after initializeDatabase() resolves. */
  static initialize(db: SQLiteDatabase): void {
    if (ServiceLocator._instance) return;
    ServiceLocator._instance = new ServiceLocator(db);
  }

  static getInstance(): ServiceLocator {
    if (!ServiceLocator._instance) {
      throw new Error(
        'ServiceLocator not initialized. Call ServiceLocator.initialize(db) first.',
      );
    }
    return ServiceLocator._instance;
  }

  /** For testing: reset the singleton so a fresh instance can be created with a mock DB. */
  static reset(): void {
    ServiceLocator._instance = null;
  }
}
