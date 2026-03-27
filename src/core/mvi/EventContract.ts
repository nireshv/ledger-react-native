/**
 * MVI EventContract — mirrors Android's EventContract / MutableEventContract pattern.
 *
 * TState  → what the UI renders (equivalent to UiState data class + MutableStateFlow)
 * TIntent → user actions flowing into the store (equivalent to sealed Intent/Event class)
 * TEffect → one-shot side effects NOT stored in state (equivalent to SharedFlow/Channel)
 */

export interface ViewState {
  isLoading: boolean;
  error: string | null;
}

/**
 * Result wrapper equivalent to Kotlin's sealed UseCaseResult.
 * Use cases return this instead of throwing, giving screens explicit error handling.
 */
export type UseCaseResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Every Zustand store follows this contract.
 * Screens only depend on TState and dispatch — never on internal store logic.
 */
export interface StoreContract<TState extends ViewState, TIntent> {
  state: TState;
  dispatch: (intent: TIntent) => Promise<void>;
}

/** One-shot effect listener — equivalent to Android's SharedFlow collector */
export type EffectListener<TEffect> = (effect: TEffect) => void;

/** Unsubscribe function returned by onEffect() */
export type Unsubscribe = () => void;
