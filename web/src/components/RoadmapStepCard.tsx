'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { RoadmapStep, RoadmapStepStatus } from '@/lib/roadmap-types';

interface RoadmapStepCardProps {
  step: RoadmapStep;
  isNext: boolean;
  onStatusChange: (status: RoadmapStepStatus) => void;
  onNotesChange: (notes: string) => void;
}

export function RoadmapStepCard({
  step,
  isNext,
  onStatusChange,
  onNotesChange,
}: RoadmapStepCardProps) {
  const t = useTranslations('roadmap');
  const [isExpanded, setIsExpanded] = useState(isNext);

  const statusIcons: Record<RoadmapStepStatus, string> = {
    'pending': '○',
    'in-progress': '◐',
    'complete': '●',
  };

  const statusColors: Record<RoadmapStepStatus, string> = {
    'pending': 'text-gray-400',
    'in-progress': 'text-blue-500',
    'complete': 'text-green-500',
  };

  const statusBgColors: Record<RoadmapStepStatus, string> = {
    'pending': 'bg-gray-100',
    'in-progress': 'bg-blue-100',
    'complete': 'bg-green-100',
  };

  return (
    <div
      className={`border rounded-lg overflow-hidden transition-all duration-200 ${
        isNext ? 'border-blue-300 shadow-md' : 'border-gray-200'
      } ${step.status === 'complete' ? 'opacity-75' : ''}`}
    >
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors"
      >
        {/* Status icon */}
        <span className={`text-xl ${statusColors[step.status]}`}>
          {statusIcons[step.status]}
        </span>

        {/* Step number and title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Step {step.order}</span>
            {isNext && step.status !== 'complete' && (
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                Next
              </span>
            )}
          </div>
          <h3 className={`font-medium truncate ${step.status === 'complete' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
            {step.title}
          </h3>
        </div>

        {/* Expand indicator */}
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {/* Description */}
          <p className="mt-3 text-sm text-gray-600">{step.description}</p>

          {/* Estimated time */}
          {step.estimatedTime && (
            <div className="mt-2 flex items-center gap-1 text-sm text-gray-500">
              <span>⏱️</span>
              <span>{t('estimatedTime')}: {step.estimatedTime}</span>
            </div>
          )}

          {/* Status buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            {(['pending', 'in-progress', 'complete'] as RoadmapStepStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => onStatusChange(status)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  step.status === status
                    ? `${statusBgColors[status]} ${statusColors[status]}`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {statusIcons[status]} {status === 'pending' ? 'Not Started' : status === 'in-progress' ? 'In Progress' : 'Complete'}
              </button>
            ))}
          </div>

          {/* Tips */}
          {step.tips && step.tips.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">💡 {t('tips')}</h4>
              <ul className="space-y-1">
                {step.tips.map((tip, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-gray-400">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sources */}
          {step.sources && step.sources.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">🔗 Sources</h4>
              <ul className="space-y-1">
                {step.sources.map((source, idx) => (
                  <li key={idx} className="text-sm">
                    {source.url ? (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {source.label} ↗
                      </a>
                    ) : (
                      <span className="text-gray-600">{source.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Notes */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">📝 {t('notes')}</h4>
            <textarea
              value={step.notes || ''}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Add your notes, appointment dates, reference numbers..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={2}
            />
          </div>

          {/* Completed timestamp */}
          {step.completedAt && (
            <p className="mt-3 text-xs text-gray-400">
              Completed: {new Date(step.completedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
