/**
 * Locale utilities for the frontend
 */

export interface LocaleOption {
  value: string;
  label: string;
}

// List of supported locales matching backend
export const SUPPORTED_LOCALES: LocaleOption[] = [
  { value: "en-US", label: "English (United States)" },
  { value: "en-GB", label: "English (United Kingdom)" },
  { value: "en-NG", label: "English (Nigeria)" },
  { value: "en-CA", label: "English (Canada)" },
  { value: "en-AU", label: "English (Australia)" },
  { value: "en-ZA", label: "English (South Africa)" },
  { value: "fr-FR", label: "French (France)" },
  { value: "fr-CA", label: "French (Canada)" },
  { value: "de-DE", label: "German (Germany)" },
  { value: "es-ES", label: "Spanish (Spain)" },
  { value: "es-MX", label: "Spanish (Mexico)" },
  { value: "es-AR", label: "Spanish (Argentina)" },
  { value: "pt-BR", label: "Portuguese (Brazil)" },
  { value: "pt-PT", label: "Portuguese (Portugal)" },
  { value: "it-IT", label: "Italian (Italy)" },
  { value: "nl-NL", label: "Dutch (Netherlands)" },
  { value: "ru-RU", label: "Russian (Russia)" },
  { value: "ja-JP", label: "Japanese (Japan)" },
  { value: "ko-KR", label: "Korean (South Korea)" },
  { value: "zh-CN", label: "Chinese (Simplified, China)" },
  { value: "zh-TW", label: "Chinese (Traditional, Taiwan)" },
  { value: "ar-SA", label: "Arabic (Saudi Arabia)" },
  { value: "hi-IN", label: "Hindi (India)" },
  { value: "th-TH", label: "Thai (Thailand)" },
  { value: "vi-VN", label: "Vietnamese (Vietnam)" },
  { value: "id-ID", label: "Indonesian (Indonesia)" },
  { value: "ms-MY", label: "Malay (Malaysia)" },
  { value: "tr-TR", label: "Turkish (Turkey)" },
  { value: "pl-PL", label: "Polish (Poland)" },
  { value: "sv-SE", label: "Swedish (Sweden)" },
  { value: "da-DK", label: "Danish (Denmark)" },
  { value: "no-NO", label: "Norwegian (Norway)" },
  { value: "fi-FI", label: "Finnish (Finland)" },
  { value: "he-IL", label: "Hebrew (Israel)" },
  { value: "cs-CZ", label: "Czech (Czech Republic)" },
  { value: "hu-HU", label: "Hungarian (Hungary)" },
  { value: "sk-SK", label: "Slovak (Slovakia)" },
  { value: "sl-SI", label: "Slovenian (Slovenia)" },
  { value: "ro-RO", label: "Romanian (Romania)" },
  { value: "bg-BG", label: "Bulgarian (Bulgaria)" },
  { value: "hr-HR", label: "Croatian (Croatia)" },
  { value: "sr-RS", label: "Serbian (Serbia)" },
  { value: "uk-UA", label: "Ukrainian (Ukraine)" },
  { value: "et-EE", label: "Estonian (Estonia)" },
  { value: "lv-LV", label: "Latvian (Latvia)" },
  { value: "lt-LT", label: "Lithuanian (Lithuania)" },
];

/**
 * Detect user's browser locale and find the best match
 */
export function detectBrowserLocale(): string {
  if (typeof window === 'undefined') {
    return 'en-US';
  }

  // Get browser locales
  const languages = navigator.languages || [navigator.language];
  
  // Normalize and find best match
  const supportedCodes = SUPPORTED_LOCALES.map(locale => locale.value);
  
  for (const browserLang of languages) {
    // Normalize locale
    const normalized = normalizeLocale(browserLang);
    
    // Check for exact match
    if (supportedCodes.includes(normalized)) {
      return normalized;
    }
    
    // Check for language-only match (e.g., 'en' -> 'en-US')
    const lang = normalized.split('-')[0];
    const languageMatch = supportedCodes.find(code => code.startsWith(`${lang}-`));
    if (languageMatch) {
      return languageMatch;
    }
  }
  
  return 'en-US';
}

/**
 * Normalize locale string to standard format
 */
export function normalizeLocale(locale: string): string {
  if (!locale) return 'en-US';
  
  // Convert to standard format (e.g., en-us -> en-US)
  const parts = locale.replace('_', '-').split('-');
  if (parts.length >= 2) {
    return `${parts[0].toLowerCase()}-${parts[1].toUpperCase()}`;
  } else if (parts.length === 1) {
    // Map common language codes to default locales
    const languageDefaults: Record<string, string> = {
      en: 'en-US',
      fr: 'fr-FR',
      de: 'de-DE',
      es: 'es-ES',
      pt: 'pt-BR',
      it: 'it-IT',
      nl: 'nl-NL',
      ru: 'ru-RU',
      ja: 'ja-JP',
      ko: 'ko-KR',
      zh: 'zh-CN',
      ar: 'ar-SA',
      hi: 'hi-IN',
      th: 'th-TH',
      vi: 'vi-VN',
      id: 'id-ID',
      ms: 'ms-MY',
      tr: 'tr-TR',
      pl: 'pl-PL',
      sv: 'sv-SE',
      da: 'da-DK',
      no: 'no-NO',
      fi: 'fi-FI',
      he: 'he-IL',
      cs: 'cs-CZ',
      hu: 'hu-HU',
      sk: 'sk-SK',
      sl: 'sl-SI',
      ro: 'ro-RO',
      bg: 'bg-BG',
      hr: 'hr-HR',
      sr: 'sr-RS',
      uk: 'uk-UA',
      et: 'et-EE',
      lv: 'lv-LV',
      lt: 'lt-LT',
    };
    return languageDefaults[parts[0].toLowerCase()] || 'en-US';
  }
  
  return 'en-US';
}

/**
 * Check if a locale is supported
 */
export function isValidLocale(locale: string): boolean {
  const supportedCodes = SUPPORTED_LOCALES.map(l => l.value);
  return supportedCodes.includes(locale);
}

/**
 * Get locale label for display
 */
export function getLocaleLabel(locale: string): string {
  const found = SUPPORTED_LOCALES.find(l => l.value === locale);
  return found ? found.label : locale;
} 