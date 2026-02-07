'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useVisaWizard } from '@/hooks/useVisaWizard';
import {
  COUNTRY_OPTIONS,
  LOCATION_OPTIONS,
  VisaStep,
  DocumentItem,
  VisaPathway,
} from '@/lib/visa-wizard-data';

// ============================================================================
// Intake Form Component
// ============================================================================

function IntakeForm({
  intakeData,
  updateField,
  onSubmit,
  isComplete,
}: {
  intakeData: ReturnType<typeof useVisaWizard>['intakeData'];
  updateField: ReturnType<typeof useVisaWizard>['updateIntakeField'];
  onSubmit: () => void;
  isComplete: boolean;
}) {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          🛂 Let&apos;s Find Your Visa Path
        </h2>
        <p className="text-gray-500">
          Answer a few questions and we&apos;ll show you exactly what you need to do.
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Country of Origin */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <label className="block text-lg font-medium text-gray-800 mb-3">
            🌍 Where are you from?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {COUNTRY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => updateField('countryOfOrigin', option.value as typeof intakeData.countryOfOrigin)}
                className={`p-4 rounded-xl border-2 text-center transition-all duration-200 hover:shadow-md ${
                  intakeData.countryOfOrigin === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl block mb-1">
                  {option.value === 'turkey' && '🇹🇷'}
                  {option.value === 'serbia' && '🇷🇸'}
                  {option.value === 'albania' && '🇦🇱'}
                  {option.value === 'other' && '🌐'}
                </span>
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Current Location */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <label className="block text-lg font-medium text-gray-800 mb-3">
            📍 Where are you now?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {LOCATION_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => updateField('currentLocation', option.value as typeof intakeData.currentLocation)}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md ${
                  intakeData.currentLocation === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl mr-3">
                  {option.value === 'home-country' ? '🏠' : '🇳🇱'}
                </span>
                <span className="font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Job Offer */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <label className="block text-lg font-medium text-gray-800 mb-3">
            💼 Do you have a job offer in the Netherlands?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => updateField('hasJobOffer', 'yes')}
              className={`p-4 rounded-xl border-2 text-center transition-all duration-200 hover:shadow-md ${
                intakeData.hasJobOffer === 'yes'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl block mb-1">✅</span>
              <span className="font-medium">Yes</span>
            </button>
            <button
              type="button"
              onClick={() => updateField('hasJobOffer', 'no')}
              className={`p-4 rounded-xl border-2 text-center transition-all duration-200 hover:shadow-md ${
                intakeData.hasJobOffer === 'no'
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl block mb-1">❌</span>
              <span className="font-medium">No</span>
            </button>
          </div>
        </div>

        {/* Conditional: Sponsor Recognition */}
        {intakeData.hasJobOffer === 'yes' && (
          <div className="bg-white rounded-xl p-6 shadow-md animate-slide-up">
            <label className="block text-lg font-medium text-gray-800 mb-2">
              🏢 Is your employer recognized by IND as a sponsor?
            </label>
            <p className="text-sm text-gray-500 mb-4">
              Check the{' '}
              <a
                href="https://ind.nl/en/public-register-recognised-sponsors"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                IND public register
              </a>{' '}
              to verify.
            </p>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => updateField('sponsorRecognized', 'yes')}
                className={`p-4 rounded-xl border-2 text-center transition-all duration-200 hover:shadow-md ${
                  intakeData.sponsorRecognized === 'yes'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="font-medium">Yes</span>
              </button>
              <button
                type="button"
                onClick={() => updateField('sponsorRecognized', 'no')}
                className={`p-4 rounded-xl border-2 text-center transition-all duration-200 hover:shadow-md ${
                  intakeData.sponsorRecognized === 'no'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="font-medium">No</span>
              </button>
              <button
                type="button"
                onClick={() => updateField('sponsorRecognized', 'dont-know')}
                className={`p-4 rounded-xl border-2 text-center transition-all duration-200 hover:shadow-md ${
                  intakeData.sponsorRecognized === 'dont-know'
                    ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="font-medium">Don&apos;t know</span>
              </button>
            </div>
          </div>
        )}

        {/* Conditional: Salary Range */}
        {intakeData.hasJobOffer === 'yes' && (
          <div className="bg-white rounded-xl p-6 shadow-md animate-slide-up">
            <label className="block text-lg font-medium text-gray-800 mb-2">
              💰 What is your expected gross monthly salary?
            </label>
            <p className="text-sm text-gray-500 mb-4">
              Kennismigrant threshold: €3,549/month (under 30) or €4,840/month (30+)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => updateField('salaryRange', 'above-threshold')}
                className={`p-4 rounded-xl border-2 text-center transition-all duration-200 hover:shadow-md ${
                  intakeData.salaryRange === 'above-threshold'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl block mb-1">📈</span>
                <span className="font-medium">Above threshold</span>
              </button>
              <button
                type="button"
                onClick={() => updateField('salaryRange', 'below-threshold')}
                className={`p-4 rounded-xl border-2 text-center transition-all duration-200 hover:shadow-md ${
                  intakeData.salaryRange === 'below-threshold'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl block mb-1">📉</span>
                <span className="font-medium">Below threshold</span>
              </button>
              <button
                type="button"
                onClick={() => updateField('salaryRange', 'dont-know')}
                className={`p-4 rounded-xl border-2 text-center transition-all duration-200 hover:shadow-md ${
                  intakeData.salaryRange === 'dont-know'
                    ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl block mb-1">🤔</span>
                <span className="font-medium">Don&apos;t know yet</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="text-center">
        <button
          onClick={onSubmit}
          disabled={!isComplete}
          className={`px-8 py-4 text-lg font-semibold rounded-full transition-all duration-200 shadow-lg ${
            isComplete
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl transform hover:scale-105'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Show My Visa Path →
        </button>
        {!isComplete && (
          <p className="mt-3 text-sm text-gray-500">
            Please answer all questions to continue
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Document Checklist Item Component
// ============================================================================

function DocumentChecklistItem({
  document,
  isChecked,
  onToggle,
}: {
  document: DocumentItem;
  isChecked: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
        isChecked
          ? 'border-green-400 bg-green-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onToggle}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
            isChecked
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300'
          }`}
        >
          {isChecked && '✓'}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium ${isChecked ? 'text-green-700 line-through' : 'text-gray-800'}`}>
            {document.name}
          </h4>
          <p className="text-sm text-gray-500 mt-1">{document.description}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="inline-flex items-center text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              📍 {document.whereToGet}
            </span>
            {document.link && (
              <a
                href={document.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
              >
                🔗 Get it here
              </a>
            )}
          </div>
          {document.tips && document.tips.length > 0 && (
            <div className="mt-2">
              {document.tips.map((tip, i) => (
                <p key={i} className="text-xs text-amber-600 flex items-start gap-1">
                  <span>💡</span>
                  <span>{tip}</span>
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Timeline Step Card Component
// ============================================================================

function TimelineStepCard({
  step,
  stepNumber,
  isCompleted,
  isNext,
  isLast,
  documentChecks,
  onToggleComplete,
  onToggleDocument,
}: {
  step: VisaStep;
  stepNumber: number;
  isCompleted: boolean;
  isNext: boolean;
  isLast: boolean;
  documentChecks: { [docId: string]: boolean };
  onToggleComplete: () => void;
  onToggleDocument: (docId: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(isNext);

  const completedDocs = step.requiredDocuments.filter(
    (doc) => documentChecks[doc.id]
  ).length;
  const totalDocs = step.requiredDocuments.length;

  return (
    <div className="relative flex gap-4">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        {/* Node */}
        <button
          onClick={onToggleComplete}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-3 transition-all duration-300 hover:scale-110 ${
            isCompleted
              ? 'bg-green-500 border-green-500 text-white'
              : isNext
              ? 'bg-orange-100 border-orange-400 text-orange-600 ring-4 ring-orange-200 ring-offset-2'
              : 'bg-gray-100 border-gray-300 text-gray-500'
          }`}
          title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {isCompleted ? '✓' : stepNumber}
        </button>
        {/* Connector line */}
        {!isLast && (
          <div
            className={`w-1 flex-1 min-h-[40px] transition-colors duration-300 ${
              isCompleted ? 'bg-green-400' : 'bg-gray-200'
            }`}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
            isCompleted
              ? 'bg-green-50 border-green-300'
              : isNext
              ? 'bg-orange-50 border-orange-300 shadow-md'
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={`font-semibold ${isCompleted ? 'text-green-700' : 'text-gray-800'}`}>
                  {step.title}
                </h3>
                {isNext && !isCompleted && (
                  <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                    Next Step
                  </span>
                )}
                {isCompleted && (
                  <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                    Complete
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">{step.description}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  ⏱️ {step.estimatedTime}
                </span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  📄 {completedDocs}/{totalDocs} docs ready
                </span>
              </div>
            </div>
            <span className="text-gray-400 text-xl flex-shrink-0">
              {isExpanded ? '−' : '+'}
            </span>
          </div>
        </button>

        {/* Expanded content */}
        {isExpanded && (
          <div className="mt-4 space-y-4 animate-fade-in">
            {/* What to do */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                📋 What to do
              </h4>
              <ul className="space-y-2">
                {step.whatToDo.map((action, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-blue-500">→</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Required Documents */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                📄 Required Documents
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                  {completedDocs}/{totalDocs}
                </span>
              </h4>
              <div className="space-y-3">
                {step.requiredDocuments.map((doc) => (
                  <DocumentChecklistItem
                    key={doc.id}
                    document={doc}
                    isChecked={documentChecks[doc.id] || false}
                    onToggle={() => onToggleDocument(doc.id)}
                  />
                ))}
              </div>
            </div>

            {/* Where to submit */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                📬 Where to submit
              </h4>
              <p className="text-sm text-gray-600">{step.whereToSubmit}</p>
              {step.submitLink && (
                <a
                  href={step.submitLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  🔗 Visit website
                </a>
              )}
            </div>

            {/* Tips */}
            {step.tips.length > 0 && (
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  💡 Tips
                </h4>
                <ul className="space-y-1">
                  {step.tips.map((tip, i) => (
                    <li key={i} className="text-sm text-blue-700 flex items-start gap-2">
                      <span>•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {step.warnings.length > 0 && (
              <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                  ⚠️ Important
                </h4>
                <ul className="space-y-1">
                  {step.warnings.map((warning, i) => (
                    <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                      <span>•</span>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Mark Complete Button */}
            <button
              onClick={onToggleComplete}
              className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                isCompleted
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  : 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {isCompleted ? '↩ Mark as Incomplete' : '✓ Mark Step as Complete'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Results View Component
// ============================================================================

function ResultsView({
  pathway,
  stepProgress,
  progress,
  completedCount,
  nextStep,
  isStepCompleted,
  isDocumentChecked,
  toggleStepComplete,
  toggleDocumentCheck,
  onBack,
  onReset,
}: {
  pathway: VisaPathway;
  stepProgress: ReturnType<typeof useVisaWizard>['stepProgress'];
  progress: number;
  completedCount: number;
  nextStep: VisaStep | undefined;
  isStepCompleted: (stepId: string) => boolean;
  isDocumentChecked: (stepId: string, docId: string) => boolean;
  toggleStepComplete: (stepId: string) => void;
  toggleDocumentCheck: (stepId: string, docId: string) => void;
  onBack: () => void;
  onReset: () => void;
}) {
  const totalSteps = pathway.steps.length;

  if (pathway.steps.length === 0) {
    // Unknown visa type or no steps
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="bg-amber-50 rounded-2xl p-8 border-2 border-amber-200 text-center">
          <div className="text-5xl mb-4">🤔</div>
          <h2 className="text-2xl font-bold text-amber-800 mb-3">
            We Need More Information
          </h2>
          <p className="text-amber-700 mb-6">
            Based on your answers, we couldn&apos;t determine the best visa pathway for you.
            This might mean you need personalized advice.
          </p>
          <div className="space-y-3">
            <a
              href="https://ind.nl/en"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
            >
              Visit IND Website
            </a>
            <button
              onClick={onBack}
              className="block w-full py-3 text-amber-700 hover:text-amber-900 transition-colors"
            >
              ← Edit My Answers
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header with visa type */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-blue-200 text-sm uppercase tracking-wider mb-1">
              Recommended Visa Type
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold">{pathway.title}</h2>
            <p className="text-blue-100 mt-2">{pathway.description}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-4xl font-bold">{progress}%</div>
            <p className="text-blue-200 text-sm">Complete</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-blue-200 mb-2">
            <span>{completedCount} of {totalSteps} steps done</span>
            <span>{pathway.totalEstimatedTime}</span>
          </div>
          <div className="w-full bg-blue-400/30 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          ← Edit Answers
        </button>
        <button
          onClick={onReset}
          className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
        >
          🔄 Start Over
        </button>
      </div>

      {/* Next Step Highlight */}
      {nextStep && progress < 100 && (
        <div className="bg-orange-50 rounded-xl p-5 border-2 border-orange-200">
          <h3 className="font-semibold text-orange-800 flex items-center gap-2">
            <span className="animate-pulse">👉</span>
            Next Up: {nextStep.title}
          </h3>
          <p className="text-orange-700 text-sm mt-1">{nextStep.description}</p>
          <p className="text-orange-600 text-xs mt-2">⏱️ {nextStep.estimatedTime}</p>
        </div>
      )}

      {/* Completion Message */}
      {progress === 100 && (
        <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200 text-center">
          <div className="text-5xl mb-3">🎉</div>
          <h3 className="text-xl font-bold text-green-800">Congratulations!</h3>
          <p className="text-green-700 mt-2">
            You&apos;ve completed all steps. Welcome to the Netherlands!
          </p>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          📍 Your Visa Journey
        </h3>
        <div className="space-y-0">
          {pathway.steps.map((step, index) => (
            <TimelineStepCard
              key={step.id}
              step={step}
              stepNumber={index + 1}
              isCompleted={isStepCompleted(step.id)}
              isNext={nextStep?.id === step.id}
              isLast={index === pathway.steps.length - 1}
              documentChecks={stepProgress[step.id]?.documentChecks || {}}
              onToggleComplete={() => toggleStepComplete(step.id)}
              onToggleDocument={(docId) => toggleDocumentCheck(step.id, docId)}
            />
          ))}
        </div>
      </div>

      {/* Eligibility Criteria */}
      {pathway.eligibilityCriteria.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            ✅ Eligibility Criteria
          </h3>
          <ul className="space-y-2">
            {pathway.eligibilityCriteria.map((criteria, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-green-500">✓</span>
                <span>{criteria}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function VisaWizardPage() {
  const {
    currentStep,
    intakeData,
    stepProgress,
    isLoaded,
    updateIntakeField,
    submitIntake,
    goBackToIntake,
    toggleStepComplete,
    toggleDocumentCheck,
    resetWizard,
    getProgress,
    getCompletedCount,
    getNextStep,
    isStepCompleted,
    isDocumentChecked,
    isIntakeComplete,
    getVisaPathway,
  } = useVisaWizard();

  const pathway = getVisaPathway();
  const progress = getProgress();
  const completedCount = getCompletedCount();
  const nextStep = getNextStep();

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-8">
        <div className="max-w-3xl mx-auto animate-pulse space-y-6">
          <div className="h-12 bg-gray-200 rounded-xl w-1/3"></div>
          <div className="h-6 bg-gray-200 rounded w-full"></div>
          <div className="h-40 bg-gray-200 rounded-xl"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 animate-fade-in">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b px-4 sm:px-6 py-4 shadow-sm sticky top-0 z-40">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛂</span>
            <h1 className="text-xl font-bold text-gray-800">Visa Wizard</h1>
            {currentStep === 'results' && pathway && (
              <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                {pathway.titleNL}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {currentStep === 'results' && (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-gray-600">{progress}%</span>
              </div>
            )}
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto p-4 sm:p-8">
        {currentStep === 'intake' ? (
          <IntakeForm
            intakeData={intakeData}
            updateField={updateIntakeField}
            onSubmit={submitIntake}
            isComplete={isIntakeComplete()}
          />
        ) : pathway ? (
          <ResultsView
            pathway={pathway}
            stepProgress={stepProgress}
            progress={progress}
            completedCount={completedCount}
            nextStep={nextStep}
            isStepCompleted={isStepCompleted}
            isDocumentChecked={isDocumentChecked}
            toggleStepComplete={toggleStepComplete}
            toggleDocumentCheck={toggleDocumentCheck}
            onBack={goBackToIntake}
            onReset={resetWizard}
          />
        ) : null}
      </div>
    </main>
  );
}
