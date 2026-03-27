# Ledger

A personal finance management app for Android built with Jetpack Compose. Track income, expenses, and transfers across multiple accounts with multi-currency support, visual analytics, and cloud backup.

---

## Objective

Ledger helps individuals manage their finances by providing:

- Multi-account, multi-currency transaction tracking
- Categorized income/expense/transfer entries
- Dashboard analytics with charts and date-range filtering
- Local and Google Drive backup/restore
- Google Sign-In with Firebase authentication

---

## Architecture

The project follows **Clean Architecture** with a custom **MVI** pattern for UI state management.

```
Presentation  →  Domain  →  Data
   (UI)        (Business)  (DB / APIs)
```

### Layers

| Layer | Package | Responsibility |
|---|---|---|
| Presentation | `presentation/` | Screens, ViewModels, Navigation |
| Domain | `domain/` | Use cases, domain models, repository interfaces |
| Data | `data/` | Room DAOs, entities, repository implementations, mappers |
| Common | `common/` | Shared utilities, MVI contracts, logging |

### Key Patterns

- **MVI** — `EventContract` / `MutableEventContract` for one-directional event flow
- **MVVM** — Kotlin Flow + ViewModel for reactive state
- **Repository Pattern** — domain layer depends on interfaces; data layer implements them
- **Use Cases** — 28+ dedicated use case classes, one responsibility each
- **Mapper Pattern** — explicit `Entity ↔ DomainModel` conversion in the data layer
- **Hilt** — dependency injection throughout all layers

---

## Package Structure

```
com.uncledroid.ledger/
├── presentation/
│   ├── dashboard/          # Home screen with analytics
│   ├── transaction/        # Transaction list and upsert
│   ├── account/            # Account management
│   ├── category/           # Category management
│   ├── report/             # Financial reports
│   ├── setting/            # App settings
│   ├── sign_in/            # Authentication
│   ├── composables/        # Reusable UI components
│   └── ScreenNavigation.kt # Navigation graph
│
├── domain/
│   ├── model/              # Transact, Account, Category, Duration
│   ├── repository/         # Repository interfaces
│   └── usecase/            # Business logic (28+ use cases)
│
├── data/
│   ├── db/                 # Room database
│   ├── dao/                # Data Access Objects
│   ├── entity/             # Room entities
│   ├── repository/         # Repository implementations
│   ├── mapper/             # Entity ↔ Domain mappers
│   ├── converter/          # Room type converters
│   └── di/                 # Hilt modules
│
└── common/
    ├── mvi/                # MVI event contract
    ├── util/               # DateTime, Math, Currency, Color helpers
    └── log/                # Custom logger
```

---

## Features

### Transactions
- Debit (expense), Credit (income), and Transfer types
- Per-transaction exchange rate for cross-currency transfers
- Filter by account and category; search by text
- Toggle inclusion/exclusion from reports

### Accounts
- Multiple accounts with independent currencies
- Per-account balance tracking
- Flag accounts in/out of the total balance

### Categories
- Custom categories with color coding
- Category-wise analytics and percentage breakdown

### Dashboard
- Balance summary across all accounts
- Income vs. expense chart (tehras charts)
- Category spending breakdown
- Configurable date ranges: Month, Year, Custom

### Reports
- Duration-based aggregation by currency and transaction type

### Backup & Sync
- Local file backup and restore
- Google Drive upload/download
- Scheduled automatic backup

### Auth & Security
- Google Sign-In via Firebase Authentication
- Biometric authentication framework

---

## Tech Stack

| Category | Library / Version |
|---|---|
| UI | Jetpack Compose BOM 2024.11.00, Material3 1.3.1 |
| Navigation | Navigation Compose 2.8.4 |
| Lifecycle | ViewModel, Flow, lifecycle-runtime-compose 2.8.7 |
| DI | Hilt 2.51.1, hilt-navigation-compose 1.2.0 |
| Database | Room 2.6.1 |
| Preferences | DataStore Preferences 1.1.1 |
| Auth | Firebase Auth 23.1.0, Google Identity 1.1.1 |
| Cloud | Google Drive API v3, google-api-client-android 1.32.1 |
| Serialization | kotlinx.serialization.json 1.7.1 |
| Charts | tehras/charts 0.2.4-alpha |
| Image loading | Coil Compose 2.5.0 |
| Kotlin | 2.0.20, KSP 2.0.20-1.0.24 |

---

## Build Configuration

| Setting | Value |
|---|---|
| Min SDK | 28 (Android 9) |
| Target SDK | 35 |
| Compile SDK | 35 |
| Java / JVM target | 17 |
| Version | 1.0.6 (code 6) |
| Database | `ledger_database.db` (destructive migration) |

---

## Best Practices

### Architecture
- Each use case class has a single public `invoke()` method and a single responsibility.
- Domain models are plain Kotlin data classes with no Android or Room dependencies.
- Repository interfaces live in the domain layer; implementations live in the data layer.
- ViewModels expose `StateFlow` / `SharedFlow`; screens observe, never pull state directly.

### Compose UI
- Screens receive state and lambda callbacks only — no ViewModel references inside composables.
- Reusable components live in `presentation/composables/`.
- Navigation uses type-safe route serialization (`kotlinx.serialization`).

### Data
- Room entities are separate from domain models; mappers handle conversion explicitly.
- Type converters handle `Calendar`, `UUID`, `Currency`, and `Color` storage.
- Foreign keys use `CASCADE` delete to keep referential integrity.

### Dependency Injection
- All dependencies are provided through Hilt modules in `data/di/`.
- No manual `new` instantiation of repositories or use cases in ViewModels.

### Code Style
- Kotlin idioms: `data class`, `sealed class`, `when` expressions, extension functions.
- `common/util/` for pure, stateless helpers (formatting, math, color).
- Custom `log/` wrapper keeps logging consistent and easy to disable in release builds.
