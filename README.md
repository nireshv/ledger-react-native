# Ledger

A personal finance management mobile app built with React Native and Expo. Track income, expenses, and transfers across multiple accounts with multi-currency support, visual analytics, and local backup.

## Features

- **Multi-account management** — track balances across accounts with custom colors and currencies
- **Transaction tracking** — log income, expenses, and cross-currency transfers with exchange rates
- **Categories** — organize spending with color-coded categories; 12 default categories seeded on first run
- **Dashboard analytics** — income vs expense charts, top category breakdowns, configurable date ranges
- **Reports** — financial summaries grouped by currency and duration
- **Backup & restore** — export and import local SQLite backup files
- **Biometric auth** — Face ID / fingerprint support via expo-local-authentication

## Tech Stack

| Layer | Library |
|-------|---------|
| Framework | React Native 0.81 + Expo ~54 |
| Navigation | Expo Router 6 (file-based) + React Navigation bottom tabs |
| State | Zustand 5 with custom MVI pattern |
| Database | expo-sqlite 16 (SQLite with WAL mode) |
| Validation | Zod 4 |
| Charts | react-native-gifted-charts |
| Dates | date-fns 4 |
| Security | expo-local-authentication + expo-secure-store |
| Language | TypeScript 5 (strict) |

## Architecture

Clean Architecture with MVI (Model-View-Intent), mirroring the original Android implementation.

```
Screens (Expo Router)
  └── Zustand Stores (Intent → State → Effect)
        └── Use Cases (domain / business logic)
              └── Repository Implementations
                    └── DAOs + SQLite (expo-sqlite)
```

**Dependency injection** is handled by a manual `ServiceLocator` singleton (`src/di/providers/ServiceLocator.ts`), initialized in `app/_layout.tsx` after the database is ready. It wires all DAOs → Repositories → Use Cases at startup.

**MVI contracts** live in `src/core/mvi/EventContract.ts`:
- `ViewState` — base interface for screen state (isLoading, error)
- `Intent` — discriminated union of user actions dispatched to stores
- `Effect` — one-shot side effects (navigation, toasts)
- `UseCaseResult<T>` — explicit success/error wrapper (no throwing)

## Project Structure

```
app/                    # Expo Router screens
  _layout.tsx           # Root layout — DB init + DI setup
  (auth)/sign-in.tsx
  (tabs)/               # 6-tab main navigation
    index.tsx           # Dashboard
    transactions.tsx
    accounts.tsx
    categories.tsx
    reports.tsx
    settings.tsx
  accounts/upsert.tsx
  categories/upsert.tsx
  transactions/upsert.tsx

src/
  core/
    db/                 # SQLite schema, migrations, seeding
    mvi/                # MVI interfaces
    theme/              # Colors, typography, spacing tokens
    utils/              # Date, currency, color, math, logging helpers
    components/         # Shared UI (AmountText, Button, Card, ColorPicker, …)
  di/providers/         # ServiceLocator (DI container)
  features/
    account/            # Accounts feature
    transaction/        # Transactions feature
    category/           # Categories feature
    dashboard/          # Dashboard analytics
    report/             # Financial reports
    settings/           # Backup, auth settings
```

Each feature follows the same module structure:
`components/` · `screens/` · `services/` (DAO, Entity, Mapper, Repository, Use Cases) · `store/` · `types/`

## Database Schema

SQLite database: `ledger_database.db` (WAL mode, foreign keys enabled)

**accounts** — id, name, currency, balance, color_hex, is_included_in_total, created_at

**categories** — id, name, color_hex, icon_name, created_at

**transactions** — id, type (`DEBIT`|`CREDIT`|`TRANSFER`), amount, currency, exchange_rate, account_id, to_account_id, category_id, note, date, is_included, created_at, updated_at

Indexes on `transactions`: date, account_id, category_id, type.

## Path Aliases

Configured in `tsconfig.json` and `babel.config.js`:

| Alias | Resolves to |
|-------|------------|
| `@/*` | `./` |
| `@features/*` | `./src/features/*` |
| `@core/*` | `./src/core/*` |
| `@di/*` | `./src/di/*` |

## Get Started

```bash
npm install
npx expo start
```

Run on a simulator/device via Expo Go, or create a [development build](https://docs.expo.dev/develop/development-builds/introduction/) for full native module support (SQLite, biometrics, document picker).
