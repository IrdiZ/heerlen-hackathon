'use client';

import { useState } from 'react';
import { useDocumentChecklist } from '@/hooks/useDocumentChecklist';
import {
  DocumentStatus,
  RequiredDocument,
  STEP_DOCUMENTS,
  getDocumentsForStep,
} from '@/lib/document-requirements';

interface DocumentCardProps {
  document: RequiredDocument;
  status: DocumentStatus;
  notes: string;
  onStatusChange: (status: DocumentStatus) => void;
  onNotesChange: (notes: string) => void;
}

function DocumentCard({
  document,
  status,
  notes,
  onStatusChange,
  onNotesChange,
}: DocumentCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const statusColors = {
    obtained: 'bg-green-50 border-green-300',
    pending: 'bg-yellow-50 border-yellow-300',
    'not-needed': 'bg-gray-50 border-gray-200',
  };

  const statusIcons = {
    obtained: '✓',
    pending: '○',
    'not-needed': '—',
  };

  return (
    <div
      className={`border-2 rounded-lg transition-all duration-200 ${statusColors[status]}`}
    >
      <div className="p-3 flex items-start gap-3">
        <span
          className={`text-xl mt-0.5 ${
            status === 'obtained'
              ? 'text-green-600'
              : status === 'not-needed'
              ? 'text-gray-400'
              : 'text-yellow-600'
          }`}
        >
          {statusIcons[status]}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4
              className={`font-medium ${
                status === 'not-needed' ? 'text-gray-500 line-through' : 'text-gray-800'
              }`}
            >
              {document.name}
            </h4>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-gray-400 hover:text-gray-600 text-sm px-2"
            >
              {showDetails ? '−' : '+'}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{document.description}</p>

          {/* Status buttons */}
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => onStatusChange('pending')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                status === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => onStatusChange('obtained')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                status === 'obtained'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              ✓ Obtained
            </button>
            <button
              onClick={() => onStatusChange('not-needed')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                status === 'not-needed'
                  ? 'bg-gray-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Not needed
            </button>
          </div>

          {/* Expandable details */}
          {showDetails && (
            <div className="mt-3 space-y-2 text-sm">
              {document.tips && document.tips.length > 0 && (
                <div>
                  <span className="font-medium text-gray-700">💡 Tips:</span>
                  <ul className="list-disc list-inside text-gray-600 ml-2 mt-1">
                    {document.tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
              {document.whereToGet && (
                <div>
                  <span className="font-medium text-gray-700">📍 Where to get:</span>
                  <span className="text-gray-600 ml-2">{document.whereToGet}</span>
                </div>
              )}
              <div>
                <span className="font-medium text-gray-700">📝 Notes:</span>
                <textarea
                  value={notes}
                  onChange={(e) => onNotesChange(e.target.value)}
                  placeholder="Add personal notes..."
                  className="w-full mt-1 p-2 border border-gray-300 rounded text-sm resize-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  rows={2}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface StepProgressProps {
  stepName: string;
  progress: { obtained: number; pending: number; notNeeded: number; total: number; percentage: number };
  canStart: boolean;
}

function StepProgress({ stepName, progress, canStart }: StepProgressProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center gap-3">
        <span
          className={`text-xl ${
            canStart ? 'text-green-600' : 'text-yellow-600'
          }`}
        >
          {canStart ? '✓' : '○'}
        </span>
        <div>
          <div className="font-medium text-gray-800">{stepName}</div>
          <div className="text-xs text-gray-500">
            {progress.obtained}/{progress.total - progress.notNeeded} documents ready
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              progress.percentage === 100 ? 'bg-green-500' : 'bg-yellow-500'
            }`}
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        <span className="text-sm font-medium text-gray-600 w-10 text-right">
          {progress.percentage}%
        </span>
      </div>
    </div>
  );
}

interface MissingDocsBannerProps {
  stepName: string;
  missingDocs: RequiredDocument[];
}

function MissingDocsBanner({ stepName, missingDocs }: MissingDocsBannerProps) {
  if (missingDocs.length === 0) return null;

  return (
    <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl">⚠️</span>
        <div>
          <h4 className="font-semibold text-amber-800">
            Missing documents for {stepName}
          </h4>
          <p className="text-sm text-amber-700 mt-1">
            You need these documents before starting this step:
          </p>
          <ul className="list-disc list-inside text-sm text-amber-700 mt-2">
            {missingDocs.map((doc) => (
              <li key={doc.id}>{doc.name}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function DocumentChecklist() {
  const {
    isLoaded,
    updateStatus,
    updateNotes,
    getStatus,
    getNotes,
    resetAll,
    getOverallProgress,
    getStepsWithReadiness,
  } = useDocumentChecklist();

  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [viewMode, setViewMode] = useState<'by-step' | 'overview'>('overview');

  if (!isLoaded) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
        ))}
      </div>
    );
  }

  const overallProgress = getOverallProgress();
  const stepsWithReadiness = getStepsWithReadiness();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">📄 Document Tracker</h2>
          <p className="text-gray-500">
            Track all documents needed for your immigration journey
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('overview')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'overview'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setViewMode('by-step')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'by-step'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            By Step
          </button>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-gray-700">Overall Document Progress</span>
          <span className="text-sm text-gray-500">
            {overallProgress.obtained} of {overallProgress.total - overallProgress.notNeeded} obtained
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              overallProgress.percentage === 100
                ? 'bg-gradient-to-r from-green-400 to-green-600'
                : 'bg-gradient-to-r from-blue-400 to-blue-600'
            }`}
            style={{ width: `${overallProgress.percentage}%` }}
          />
        </div>
        <div className="mt-2 flex justify-center gap-6 text-sm">
          <span className="text-green-600">
            ✓ {overallProgress.obtained} obtained
          </span>
          <span className="text-yellow-600">
            ○ {overallProgress.pending} pending
          </span>
          <span className="text-gray-400">
            — {overallProgress.notNeeded} not needed
          </span>
        </div>
      </div>

      {viewMode === 'overview' ? (
        /* Overview Mode - Step Progress Summary */
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700">Readiness by Step</h3>
          {stepsWithReadiness.map((step) => (
            <div key={step.stepId}>
              <StepProgress
                stepName={step.stepName}
                progress={step.progress}
                canStart={step.canStart}
              />
              {!step.canStart && step.missingDocs.length > 0 && (
                <div className="mt-2 ml-8">
                  <MissingDocsBanner
                    stepName={step.stepName}
                    missingDocs={step.missingDocs}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* By Step Mode - Expandable Steps */
        <div className="space-y-4">
          {STEP_DOCUMENTS.map((step) => {
            const stepDocs = getDocumentsForStep(step.stepId);
            const isExpanded = expandedStep === step.stepId;
            const stepProgress = stepsWithReadiness.find(
              (s) => s.stepId === step.stepId
            );

            return (
              <div
                key={step.stepId}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedStep(isExpanded ? null : step.stepId)
                  }
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-2xl ${
                        stepProgress?.canStart
                          ? 'text-green-600'
                          : 'text-yellow-600'
                      }`}
                    >
                      {stepProgress?.canStart ? '✓' : '○'}
                    </span>
                    <div>
                      <div className="font-semibold text-gray-800">
                        {step.stepName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {stepProgress?.progress.obtained}/
                        {(stepProgress?.progress.total || 0) -
                          (stepProgress?.progress.notNeeded || 0)}{' '}
                        documents ready
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          stepProgress?.progress.percentage === 100
                            ? 'bg-green-500'
                            : 'bg-yellow-500'
                        }`}
                        style={{
                          width: `${stepProgress?.progress.percentage || 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-gray-400 text-xl">
                      {isExpanded ? '−' : '+'}
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
                    {/* Missing docs warning */}
                    {stepProgress && !stepProgress.canStart && (
                      <div className="mt-3">
                        <MissingDocsBanner
                          stepName={step.stepName}
                          missingDocs={stepProgress.missingDocs}
                        />
                      </div>
                    )}

                    {/* Document cards */}
                    <div className="mt-3 space-y-2">
                      {stepDocs.map((doc) => (
                        <DocumentCard
                          key={doc.id}
                          document={doc}
                          status={getStatus(doc.id)}
                          notes={getNotes(doc.id)}
                          onStatusChange={(status) =>
                            updateStatus(doc.id, status)
                          }
                          onNotesChange={(notes) => updateNotes(doc.id, notes)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reset button */}
      <div className="flex justify-center pt-4">
        {showResetConfirm ? (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            <span className="text-red-700 text-sm">Reset all documents?</span>
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
            Reset all documents
          </button>
        )}
      </div>
    </div>
  );
}
