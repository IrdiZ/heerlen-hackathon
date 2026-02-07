'use client';

import { SUPPORTED_LANGUAGES } from '@/lib/elevenlabs-config';

export function LanguageHint() {
  return (
    <div className="text-center">
      <p className="text-gray-500 text-sm mb-2">
        🌍 Speak in any language — I&apos;ll respond in yours
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {SUPPORTED_LANGUAGES.slice(0, 6).map((lang) => (
          <span
            key={lang.code}
            className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600"
          >
            {lang.name}
          </span>
        ))}
        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
          +{SUPPORTED_LANGUAGES.length - 6} more
        </span>
      </div>
    </div>
  );
}
