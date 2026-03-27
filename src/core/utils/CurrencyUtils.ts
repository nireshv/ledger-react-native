/**
 * CurrencyUtils — pure formatting and parsing helpers.
 * No Android/RN dependencies — testable in pure JS.
 */

export const CurrencyUtils = {
  /**
   * Format an amount with the given currency code.
   * e.g. formatAmount(1234.5, 'USD') → "$1,234.50"
   */
  formatAmount(amount: number, currency: string, locale = 'en-US'): string {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      // Fallback for unknown currency codes
      return `${currency} ${amount.toFixed(2)}`;
    }
  },

  /**
   * Format an amount without the currency symbol (for inputs).
   */
  formatNumber(amount: number, locale = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  },

  /**
   * Parse a string to a numeric amount, stripping currency symbols and commas.
   * Returns NaN if the string cannot be parsed.
   */
  parseAmount(input: string): number {
    const cleaned = input.replace(/[^\d.-]/g, '');
    return parseFloat(cleaned);
  },

  /**
   * Returns a list of commonly used ISO 4217 currency codes.
   */
  commonCurrencies(): string[] {
    return [
      'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF',
      'CNY', 'HKD', 'SGD', 'INR', 'MXN', 'BRL', 'KRW',
      'SEK', 'NOK', 'DKK', 'NZD', 'ZAR', 'AED',
    ];
  },

  /**
   * Convert an amount using an exchange rate.
   * amount × rate gives the equivalent amount in the destination currency.
   */
  convert(amount: number, exchangeRate: number): number {
    return MathUtils.round(amount * exchangeRate, 2);
  },
};

/** Imported here to avoid circular deps via a re-export */
import { MathUtils } from './MathUtils';
