'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ProgressTracker } from '@/components/ProgressTracker';
import { useRoadmap } from '@/hooks/useRoadmap';

export default function PlanPage() {
  const t = useTranslations();
  const { roadmap, setStepStatus, updateNotes, clearRoadmap } = useRoadmap();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white border-b px-4 sm:px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← {t('header.back')}
            </Link>
            <span className="text-2xl">📍</span>
            <h1 className="text-xl font-bold text-gray-800">
              {t('roadmap.title')}
            </h1>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {roadmap ? (
          <ProgressTracker
            roadmap={roadmap}
            onSetStatus={setStepStatus}
            onUpdateNotes={updateNotes}
            onClear={clearRoadmap}
          />
        ) : (
          // Empty state
          <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 text-center">
            <div className="text-6xl mb-4">📍</div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2">
              {t('roadmap.empty')}
            </h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Start a voice conversation to create your personalized immigration
              roadmap based on your situation.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors shadow-lg shadow-blue-500/30"
            >
              🎤 Start Conversation
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
