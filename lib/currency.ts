/**
 * Currency utilities for formatting prices with dynamic currency codes
 */

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface CurrencyResponse {
  currencies: Currency[];
  total: number;
}

/**
 * Format a price with the given currency code using Intl.NumberFormat
 */
export function formatPrice(
  amount: number | null | undefined, 
  currencyCode: string = 'USD', 
  locale: string = 'en-US'
): string {
  if (amount === null || amount === undefined) {
    return 'Price on request';
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  } catch (error) {
    // Fallback if currency code is invalid
    console.warn(`Invalid currency code: ${currencyCode}, falling back to USD`);
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }
}

/**
 * Get currency symbol for a given currency code
 */
export function getCurrencySymbol(currencyCode: string = 'USD', locale: string = 'en-US'): string {
  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    
    // Extract just the symbol by formatting 0 and removing digits
    const formatted = formatter.format(0);
    return formatted.replace(/[\d\s]/g, '');
  } catch (error) {
    console.warn(`Invalid currency code: ${currencyCode}, falling back to $`);
    return '$';
  }
}

/**
 * Fetch available currencies from the API
 */
export async function fetchCurrencies(): Promise<Currency[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${baseUrl}/api/v1/currencies`);
    if (!response.ok) {
      throw new Error('Failed to fetch currencies');
    }
    const data: CurrencyResponse = await response.json();
    return data.currencies;
  } catch (error) {
    console.error('Error fetching currencies:', error);
    return [];
  }
}

/**
 * Fetch popular currencies from the API
 */
export async function fetchPopularCurrencies(): Promise<Currency[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const url = `${baseUrl}/api/v1/currencies/popular`;
    console.log('Fetching currencies from:', url);
    
    const response = await fetch(url);
    console.log('Currency API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Currency API error:', response.status, errorText);
      throw new Error(`Failed to fetch popular currencies: ${response.status}`);
    }
    
    const data: CurrencyResponse = await response.json();
    console.log('Fetched currencies count:', data.currencies?.length || 0);
    
    return data.currencies || [];
  } catch (error) {
    console.error('Error fetching popular currencies:', error);
    console.log('Using fallback currencies');
    // Fallback to common currencies if API fails
    return [
      { code: 'USD', name: 'US Dollar', symbol: '$' },
      { code: 'EUR', name: 'Euro', symbol: '€' },
      { code: 'GBP', name: 'British Pound', symbol: '£' },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    ];
  }
} 