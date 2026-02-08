'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { locales, localeNames, isRTL, type Locale } from '@/i18n/config';

export function LanguageSwitcher() {
  const t = useTranslations('languageSwitcher');
  const currentLocale = useLocale() as Locale;
  const rtl = isRTL(currentLocale);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocaleChange = (newLocale: Locale) => {
    // Set cookie
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`; // 1 year
    // Store in localStorage for persistence
    localStorage.setItem('preferred-locale', newLocale);
    // Reload to apply new locale
    window.location.reload();
  };

  // Get flag emoji for locale
  const getFlag = (locale: Locale) => {
    const flags: Record<Locale, string> = {
      en: '🇬🇧',
      ar: '🇸🇦',
      uk: '🇺🇦',
      tr: '🇹🇷',
    };
    return flags[locale];
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
        style={{ color: 'var(--w-text-secondary)', background: 'var(--w-bg-raised)', border: '1px solid var(--w-border)' }}
        aria-label={t('label')}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{getFlag(currentLocale)}</span>
        <span className="hidden sm:inline">{localeNames[currentLocale]}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className={`absolute ${rtl ? 'left-0' : 'right-0'} mt-2 w-44 rounded-xl shadow-lg py-1 z-50 animate-fade-in`}
          style={{ background: 'var(--w-bg-elevated)', border: '1px solid var(--w-border)' }}
          role="listbox"
          aria-label={t('label')}
        >
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => {
                handleLocaleChange(locale);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 ${
                locale === currentLocale
                  ? 'font-medium'
                  : ''
              }`}
              style={{
                color: locale === currentLocale ? 'var(--w-accent)' : 'var(--w-text-secondary)',
                background: locale === currentLocale ? 'var(--w-accent-soft)' : 'transparent',
              }}
              onMouseEnter={(e) => { if (locale !== currentLocale) e.currentTarget.style.background = 'var(--w-bg-surface)'; }}
              onMouseLeave={(e) => { if (locale !== currentLocale) e.currentTarget.style.background = 'transparent'; }}
              role="option"
              aria-selected={locale === currentLocale}
            >
              <span className="text-lg">{getFlag(locale)}</span>
              <span>{localeNames[locale]}</span>
              {locale === currentLocale && (
                <svg className="w-4 h-4 text-orange-500" style={{ marginInlineStart: 'auto' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
