// Supported locales
export const locales = ['en', 'ar', 'uk', 'tr'] as const;
export type Locale = (typeof locales)[number];

// Default locale
export const defaultLocale: Locale = 'en';

// RTL languages
export const rtlLocales: Locale[] = ['ar'];

// Locale names for display
export const localeNames: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية',
  uk: 'Українська',
  tr: 'Türkçe',
};

// Check if locale is RTL
export function isRTL(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}
