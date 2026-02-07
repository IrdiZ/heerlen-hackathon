'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Roadmap, RoadmapStepStatus } from '@/lib/roadmap-types';
import { RoadmapStepCard } from './RoadmapStepCard';

interface ProgressTrackerProps {
  roadmap: Roadmap;
  onSetStatus: (stepId: string, status: RoadmapStepStatus) => void;
  onUpdateNotes: (stepId: string, notes: string) => void;
  onClear: () => void;
}

export function ProgressTracker({
  roadmap,
  onSetStatus,
  onUpdateNotes,
  onClear,
}: ProgressTrackerProps) {
  const t = useTranslations('roadmap');
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const completedCount = roadmap.steps.filter(s => s.status === 'complete').length;
  const totalSteps = roadmap.steps.length;
  const progress = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  // Find the next incomplete step
  const sortedSteps = [...roadmap.steps].sort((a, b) => a.order - b.order);
  const nextStep = sortedSteps.find(step => step.status !== 'complete');

  const handleClear = () => {
    onClear();
    setShowConfirmClear(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{roadmap.name}</h2>
            <p className="text-sm text-blue-100 mt-1">
              {completedCount} of {totalSteps} steps complete
            </p>
          </div>
          <div className="text-3xl font-bold">{progress}%</div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 bg-blue-400/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Next Action Card */}
      {nextStep && (
        <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
          <div className="flex items-center gap-2 text-sm font-medium text-blue-700 mb-2">
            <span>🎯</span>
            <span>{t('nextAction')}</span>
          </div>
          <h3 className="font-semibold text-gray-900">{nextStep.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{nextStep.description}</p>
          {nextStep.estimatedTime && (
            <p className="text-xs text-gray-500 mt-2">⏱️ {nextStep.estimatedTime}</p>
          )}
          {nextStep.status === 'pending' && (
            <button
              onClick={() => onSetStatus(nextStep.id, 'in-progress')}
              className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start This Step
            </button>
          )}
        </div>
      )}

      {/* All steps complete message */}
      {!nextStep && totalSteps > 0 && (
        <div className="px-6 py-8 bg-green-50 border-b border-green-100 text-center">
          <div className="text-4xl mb-2">🎉</div>
          <h3 className="font-semibold text-green-800">All steps completed!</h3>
          <p className="text-sm text-green-600 mt-1">Congratulations on completing your immigration journey.</p>
        </div>
      )}

      {/* Steps list */}
      <div className="p-6 space-y-3">
        <h3 className="text-sm font-medium text-gray-500 mb-4">Timeline</h3>
        {sortedSteps.map((step) => (
          <RoadmapStepCard
            key={step.id}
            step={step}
            isNext={nextStep?.id === step.id}
            onStatusChange={(status) => onSetStatus(step.id, status)}
            onNotesChange={(notes) => onUpdateNotes(step.id, notes)}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Created: {new Date(roadmap.createdAt).toLocaleDateString()}
          </p>

          {showConfirmClear ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-600">Clear roadmap?</span>
              <button
                onClick={handleClear}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Yes
              </button>
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmClear(true)}
              className="text-sm text-red-500 hover:text-red-700"
            >
              {t('clear')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
