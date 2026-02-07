'use client';

import { useState } from 'react';
import { useChecklist } from '@/hooks/useChecklist';
import {
  IMMIGRATION_STEPS,
  getStepsByOrder,
  StepStatus,
} from '@/lib/immigration-steps';

interface StepCardProps {
  step: (typeof IMMIGRATION_STEPS)[0];
  status: StepStatus;
  isNext: boolean;
  isExpanded: boolean;
  notes: string;
  onToggle: () => void;
  onStatusChange: (status: StepStatus) => void;
  onNotesChange: (notes: string) => void;
}

function StepCard({
  step,
  status,
  isNext,
  isExpanded,
  notes,
  onToggle,
  onStatusChange,
  onNotesChange,
}: StepCardProps) {
  const statusColors = {
    pending: 'bg-gray-100 border-gray-200',
    'in-progress': 'bg-yellow-50 border-yellow-300',
    complete: 'bg-green-50 border-green-300',
  };

  const statusIcons = {
    pending: '○',
    'in-progress': '◐',
    complete: '●',
  };

  const statusLabels = {
    pending: 'Not started',
    'in-progress': 'In progress',
    complete: 'Complete',
  };

  return (
    <div
      className={`border-2 rounded-xl transition-all duration-200 ${statusColors[status]} ${
        isNext ? 'ring-2 ring-orange-400 ring-offset-2' : ''
      }`}
    >
      {/* Header - Always visible */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{statusIcons[status]}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800">{step.title}</span>
              {isNext && (
                <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">
                  Next step
                </span>
              )}
            </div>
            <span className="text-sm text-gray-500">
              {statusLabels[status]} • {step.estimatedTime}
            </span>
          </div>
        </div>
        <span className="text-gray-400 text-xl">{isExpanded ? '−' : '+'}</span>
      </button>

      {/* Expandable content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Description */}
          <p className="text-gray-600">{step.description}</p>

          {/* Status buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => onStatusChange('pending')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                status === 'pending'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Not started
            </button>
            <button
              onClick={() => onStatusChange('in-progress')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                status === 'in-progress'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              }`}
            >
              In progress
            </button>
            <button
              onClick={() => onStatusChange('complete')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                status === 'complete'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              }`}
            >
              ✓ Complete
            </button>
          </div>

          {/* Required documents */}
          <div>
            <h4 className="font-medium text-gray-800 mb-2">
              📄 Required Documents
            </h4>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              {step.requiredDocuments.map((doc, i) => (
                <li key={i}>{doc}</li>
              ))}
            </ul>
          </div>

          {/* Tips */}
          <div>
            <h4 className="font-medium text-gray-800 mb-2">💡 Tips</h4>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              {step.tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>

          {/* Common mistakes */}
          <div>
            <h4 className="font-medium text-gray-800 mb-2">
              ⚠️ Common Mistakes
            </h4>
            <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
              {step.commonMistakes.map((mistake, i) => (
                <li key={i}>{mistake}</li>
              ))}
            </ul>
          </div>

          {/* Personal notes */}
          <div>
            <h4 className="font-medium text-gray-800 mb-2">📝 Your Notes</h4>
            <textarea
              value={notes}
              onChange={e => onNotesChange(e.target.value)}
              placeholder="Add personal notes, appointment dates, reference numbers..."
              className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              rows={2}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function ImmigrationChecklist() {
  const {
    isLoaded,
    getProgress,
    getCompletedCount,
    getNextStep,
    getStatus,
    getNotes,
    updateStatus,
    updateNotes,
    resetAll,
    totalSteps,
  } = useChecklist();

  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const toggleExpanded = (stepId: string) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedSteps(new Set(IMMIGRATION_STEPS.map(s => s.id)));
  };

  const collapseAll = () => {
    setExpandedSteps(new Set());
  };

  if (!isLoaded) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
        ))}
      </div>
    );
  }

  const progress = getProgress();
  const completedCount = getCompletedCount();
  const nextStep = getNextStep();
  const orderedSteps = getStepsByOrder();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            🇳🇱 Immigration Checklist
          </h2>
          <p className="text-gray-500">
            Your step-by-step guide to settling in the Netherlands
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1"
          >
            Expand all
          </button>
          <button
            onClick={collapseAll}
            className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1"
          >
            Collapse all
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-gray-700">Your Progress</span>
          <span className="text-sm text-gray-500">
            {completedCount} of {totalSteps} complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 text-center">
          {progress === 100 ? (
            <span className="text-green-600 font-medium">
              🎉 All steps complete! Welcome to the Netherlands!
            </span>
          ) : nextStep ? (
            <span className="text-orange-600">
              Next: <strong>{nextStep.title}</strong>
            </span>
          ) : null}
        </div>
      </div>

      {/* Step cards */}
      <div className="space-y-3">
        {orderedSteps.map(step => (
          <StepCard
            key={step.id}
            step={step}
            status={getStatus(step.id)}
            isNext={nextStep?.id === step.id}
            isExpanded={expandedSteps.has(step.id)}
            notes={getNotes(step.id)}
            onToggle={() => toggleExpanded(step.id)}
            onStatusChange={status => updateStatus(step.id, status)}
            onNotesChange={newNotes => updateNotes(step.id, newNotes)}
          />
        ))}
      </div>

      {/* Reset button */}
      <div className="flex justify-center pt-4">
        {showResetConfirm ? (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            <span className="text-red-700 text-sm">Reset all progress?</span>
            <button
              onClick={() => {
                resetAll();
                setShowResetConfirm(false);
              }}
              className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              Yes, reset
            </button>
            <button
              onClick={() => setShowResetConfirm(false)}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="text-sm text-gray-400 hover:text-red-500"
          >
            Reset checklist
          </button>
        )}
      </div>
    </div>
  );
}
