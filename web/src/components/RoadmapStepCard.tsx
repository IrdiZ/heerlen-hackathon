'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { 
  RoadmapStep, 
  RoadmapStepStatus,
  StepFee,
  StepDocument,
  StepPitfall,
  VerifiedSource,
  ActionLink
} from '@/lib/roadmap-types';
import { DataFreshnessBadge, DataStalenessWarning } from './DataFreshnessIndicator';

interface RoadmapStepCardProps {
  step: RoadmapStep;
  isNext: boolean;
  onStatusChange: (status: RoadmapStepStatus) => void;
  onNotesChange: (notes: string) => void;
}

// Collapsible section component for consistent styling
function CollapsibleSection({ 
  title, 
  icon, 
  children, 
  defaultOpen = false,
  className = ""
}: { 
  title: string; 
  icon: string; 
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className={`mt-4 rounded-xl border overflow-hidden ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/10 transition-all duration-200"
      >
        <span className="flex items-center gap-2 font-semibold text-sm">
          <span className="text-lg">{icon}</span>
          {title}
        </span>
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
        <div className="px-4 pb-4 border-t border-white/10">
          {children}
        </div>
      )}
    </div>
  );
}

export function RoadmapStepCard({
  step,
  isNext,
  onStatusChange,
  onNotesChange,
}: RoadmapStepCardProps) {
  const t = useTranslations('roadmap');
  const [isExpanded, setIsExpanded] = useState(isNext);
  const [checkedDocuments, setCheckedDocuments] = useState<Set<string>>(new Set());

  const toggleDocument = useCallback((docName: string) => {
    setCheckedDocuments(prev => {
      const next = new Set(prev);
      if (next.has(docName)) {
        next.delete(docName);
      } else {
        next.add(docName);
      }
      return next;
    });
  }, []);

  const statusIcons: Record<RoadmapStepStatus, string> = {
    'pending': '○',
    'in-progress': '◐',
    'complete': '✓',
  };

  const statusRingColors: Record<RoadmapStepStatus, string> = {
    'pending': 'ring-slate-300',
    'in-progress': 'ring-blue-400',
    'complete': 'ring-emerald-400',
  };

  // Calculate total fees if any
  const totalFees = step.fees?.reduce((sum, fee) => sum + fee.amount, 0) || 0;

  // Get severity color for pitfalls
  const getSeverityColor = (severity: StepPitfall['severity']) => {
    switch (severity) {
      case 'common': return 'bg-red-500/20 border-red-500/50 text-red-200';
      case 'occasional': return 'bg-orange-500/20 border-orange-500/50 text-orange-200';
      case 'rare': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200';
      default: return 'bg-red-500/20 border-red-500/50 text-red-200';
    }
  };

  // Get source type badge
  const getSourceTypeBadge = (type: VerifiedSource['type']) => {
    switch (type) {
      case 'official': return { bg: 'bg-emerald-500/20', text: 'text-emerald-300', label: 'Official' };
      case 'government': return { bg: 'bg-blue-500/20', text: 'text-blue-300', label: 'Government' };
      case 'verified-third-party': return { bg: 'bg-purple-500/20', text: 'text-purple-300', label: 'Verified' };
      case 'community': return { bg: 'bg-slate-500/20', text: 'text-slate-300', label: 'Community' };
      default: return { bg: 'bg-slate-500/20', text: 'text-slate-300', label: 'Source' };
    }
  };

  // Get action type icon
  const getActionIcon = (type: ActionLink['type']) => {
    switch (type) {
      case 'portal': return '🌐';
      case 'form': return '📝';
      case 'pdf': return '📄';
      case 'external': return '🔗';
      default: return '→';
    }
  };

  return (
    <>
      {/* Keyframe animations */}
      <style jsx>{`
        @keyframes checkmark-pop {
          0% { transform: scale(0) rotate(-45deg); opacity: 0; }
          50% { transform: scale(1.3) rotate(0deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.5); }
          70% { box-shadow: 0 0 0 8px rgba(249, 115, 22, 0); }
          100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(249, 115, 22, 0.3); }
          50% { box-shadow: 0 0 30px rgba(249, 115, 22, 0.5); }
        }
        @keyframes slide-down {
          from { opacity: 0; max-height: 0; transform: translateY(-10px); }
          to { opacity: 1; max-height: 2000px; transform: translateY(0); }
        }
        @keyframes float-up {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-20px) rotate(180deg); opacity: 0; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .card-hover {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .card-hover:hover {
          transform: translateY(-2px);
        }
        .expand-content {
          animation: slide-down 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .status-icon-complete {
          animation: checkmark-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .next-badge {
          animation: pulse-ring 2s infinite;
        }
        .next-card {
          animation: glow-pulse 3s ease-in-out infinite;
        }
        .primary-cta {
          background: linear-gradient(90deg, #f97316, #ea580c, #f97316);
          background-size: 200% 100%;
          animation: shimmer 3s ease-in-out infinite;
        }
        .source-link {
          position: relative;
          transition: all 0.2s ease;
        }
        .source-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #f97316, #ea580c);
          transition: width 0.3s ease;
        }
        .source-link:hover::after {
          width: 100%;
        }
        .source-link:hover {
          color: #fb923c;
        }
        .document-checkbox {
          transition: all 0.2s ease;
        }
        .document-checkbox:checked {
          background: #22c55e;
          border-color: #22c55e;
        }
      `}</style>

      <div
        className={`card-hover relative rounded-2xl overflow-hidden backdrop-blur-sm border-2 transition-all duration-300 ${
          isNext && step.status !== 'complete'
            ? 'next-card border-orange-400/50 bg-gradient-to-br from-slate-900 via-slate-800/95 to-orange-900/20 shadow-xl shadow-orange-500/10'
            : step.status === 'complete'
            ? 'border-emerald-500/30 bg-gradient-to-br from-slate-900 via-emerald-900/20 to-slate-800 shadow-lg shadow-emerald-500/5'
            : 'border-slate-700/50 bg-slate-900/90 shadow-md hover:shadow-xl hover:border-slate-600/50'
        }`}
      >
        {/* Decorative gradient overlay for next step */}
        {isNext && step.status !== 'complete' && (
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-orange-500/5 pointer-events-none" />
        )}

        {/* Confetti particles for completed steps */}
        {step.status === 'complete' && (
          <div className="absolute top-2 right-2 pointer-events-none">
            {['🎉', '✨', '⭐'].map((emoji, i) => (
              <span
                key={i}
                className="absolute text-xs opacity-60"
                style={{
                  animation: `float-up 2s ease-out ${i * 0.3}s infinite`,
                  left: `${i * 12}px`,
                }}
              >
                {emoji}
              </span>
            ))}
          </div>
        )}

        {/* Header - always visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-white/5 transition-all duration-300 group"
        >
          {/* Status icon with ring effect */}
          <div className="relative">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ring-2 ${statusRingColors[step.status]} transition-all duration-300 ${
                step.status === 'complete'
                  ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white'
                  : step.status === 'in-progress'
                  ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                  : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
              }`}
            >
              <span
                className={`text-lg font-bold ${step.status === 'complete' ? 'status-icon-complete' : ''}`}
              >
                {statusIcons[step.status]}
              </span>
            </div>
            {/* Pulse effect for in-progress */}
            {step.status === 'in-progress' && (
              <div className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-30" />
            )}
          </div>

          {/* Step number and title */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Step {step.order}
              </span>
              {step.formNumber && (
                <span className="px-2 py-0.5 text-xs font-mono bg-slate-800 text-slate-400 rounded">
                  {step.formNumber}
                </span>
              )}
              {isNext && step.status !== 'complete' && (
                <span className="next-badge px-2.5 py-0.5 text-xs font-bold bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full shadow-lg shadow-orange-500/30">
                  Next
                </span>
              )}
              {step.status === 'in-progress' && (
                <span className="px-2.5 py-0.5 text-xs font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full animate-pulse">
                  In Progress
                </span>
              )}
              {step.lastVerified && (
                <DataFreshnessBadge 
                  lastVerified={step.lastVerified} 
                  sourceName={step.title}
                />
              )}
            </div>
            <h3
              className={`font-semibold text-base transition-all duration-300 ${
                step.status === 'complete'
                  ? 'line-through text-slate-500 decoration-emerald-400 decoration-2'
                  : 'text-white group-hover:text-orange-400'
              }`}
            >
              {step.title}
            </h3>
            {/* Quick stats row */}
            {(totalFees > 0 || step.documentsRequired?.length) && (
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                {totalFees > 0 && (
                  <span className="flex items-center gap-1">
                    💰 €{totalFees.toFixed(0)}
                  </span>
                )}
                {step.documentsRequired && step.documentsRequired.length > 0 && (
                  <span className="flex items-center gap-1">
                    📋 {step.documentsRequired.length} docs
                  </span>
                )}
                {step.pitfalls && step.pitfalls.length > 0 && (
                  <span className="flex items-center gap-1 text-red-400">
                    ⚠️ {step.pitfalls.length} warnings
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Expand indicator with smooth rotation */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center bg-slate-800 group-hover:bg-slate-700 transition-all duration-300 ${
              isExpanded ? 'rotate-180 bg-orange-900/50' : ''
            }`}
          >
            <svg
              className="w-4 h-4 text-slate-400 transition-colors group-hover:text-orange-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {/* Expanded content with spring animation */}
        {isExpanded && (
          <div className="expand-content px-5 pb-5 border-t border-slate-700/50">
            {/* Data Staleness Warning */}
            {step.lastVerified && (
              <div className="mt-4">
                <DataStalenessWarning 
                  lastVerified={step.lastVerified}
                  sourceName={step.title}
                />
              </div>
            )}

            {/* Description */}
            <p className="mt-4 text-sm text-slate-300 leading-relaxed">{step.description}</p>

            {/* Primary Action Button - Big Orange CTA */}
            {step.primaryAction && (
              <div className="mt-5">
                <a
                  href={step.primaryAction.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="primary-cta flex items-center justify-center gap-3 w-full px-6 py-4 text-white font-bold text-lg rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  <span className="text-xl">{getActionIcon(step.primaryAction.type)}</span>
                  <span>{step.primaryAction.label}</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
                {step.primaryAction.notes && (
                  <p className="mt-2 text-xs text-slate-500 text-center">{step.primaryAction.notes}</p>
                )}
                {step.primaryAction.requiresAuth && (
                  <p className="mt-1 text-xs text-orange-400 text-center flex items-center justify-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Requires login/account
                  </p>
                )}
              </div>
            )}

            {/* Portal URL (if no primary action but portal exists) */}
            {!step.primaryAction && step.portalUrl && (
              <div className="mt-4">
                <a
                  href={step.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition-all duration-200"
                >
                  <span>🌐</span>
                  <span className="font-medium">Go to Portal</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}

            {/* Estimated time with icon */}
            {step.estimatedTime && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full">
                <span className="text-base">⏱️</span>
                <span className="text-xs font-medium text-slate-300">
                  {t('estimatedTime')}: {step.estimatedTime}
                </span>
              </div>
            )}

            {/* Fees Section */}
            {step.fees && step.fees.length > 0 && (
              <div className="mt-5 p-4 bg-gradient-to-br from-emerald-900/30 to-slate-800 rounded-xl border border-emerald-500/30">
                <h4 className="text-sm font-bold text-emerald-300 mb-3 flex items-center gap-2">
                  <span className="text-lg">💰</span>
                  Costs & Fees
                </h4>
                <div className="space-y-3">
                  {step.fees.map((fee, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-slate-200">{fee.description}</p>
                        {fee.notes && (
                          <p className="text-xs text-slate-500 mt-0.5">{fee.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-emerald-300">
                          {fee.currency === 'EUR' ? '€' : fee.currency === 'USD' ? '$' : fee.currency === 'GBP' ? '£' : ''}{fee.amount}
                        </span>
                        {fee.paymentUrl && (
                          <a
                            href={fee.paymentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-xs text-orange-400 hover:text-orange-300 mt-1"
                          >
                            Pay online →
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                  {step.fees.length > 1 && (
                    <div className="pt-2 mt-2 border-t border-emerald-500/20 flex justify-between">
                      <span className="text-sm font-semibold text-slate-300">Total</span>
                      <span className="text-lg font-bold text-emerald-300">€{totalFees.toFixed(0)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Documents Checklist */}
            {step.documentsRequired && step.documentsRequired.length > 0 && (
              <CollapsibleSection
                title={`Documents Required (${step.documentsRequired.length})`}
                icon="📋"
                defaultOpen={true}
                className="bg-slate-800/50 border-slate-700"
              >
                <div className="mt-3 space-y-2">
                  {step.documentsRequired.map((doc, idx) => (
                    <label
                      key={idx}
                      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        checkedDocuments.has(doc.name)
                          ? 'bg-emerald-500/10 border border-emerald-500/30'
                          : 'bg-slate-700/50 hover:bg-slate-700 border border-transparent'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checkedDocuments.has(doc.name)}
                        onChange={() => toggleDocument(doc.name)}
                        className="document-checkbox w-5 h-5 mt-0.5 rounded border-2 border-slate-500 bg-transparent appearance-none cursor-pointer checked:bg-emerald-500 checked:border-emerald-500 relative after:content-['✓'] after:text-white after:text-xs after:absolute after:inset-0 after:flex after:items-center after:justify-center after:opacity-0 checked:after:opacity-100"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${
                            checkedDocuments.has(doc.name) ? 'text-emerald-300 line-through' : 'text-slate-200'
                          }`}>
                            {doc.name}
                          </span>
                          {doc.required && (
                            <span className="px-1.5 py-0.5 text-xs bg-red-500/20 text-red-300 rounded">
                              Required
                            </span>
                          )}
                          {doc.apostilleRequired && (
                            <span className="px-1.5 py-0.5 text-xs bg-purple-500/20 text-purple-300 rounded">
                              Apostille
                            </span>
                          )}
                        </div>
                        {doc.description && (
                          <p className="text-xs text-slate-500 mt-1">{doc.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          {doc.obtainFrom && (
                            <span className="flex items-center gap-1">
                              📍 {doc.obtainUrl ? (
                                <a href={doc.obtainUrl} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300">
                                  {doc.obtainFrom}
                                </a>
                              ) : doc.obtainFrom}
                            </span>
                          )}
                          {doc.estimatedTime && (
                            <span>⏱️ {doc.estimatedTime}</span>
                          )}
                          {doc.validityPeriod && (
                            <span>📅 Valid: {doc.validityPeriod}</span>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="mt-3 text-xs text-slate-500 text-right">
                  {checkedDocuments.size} of {step.documentsRequired.length} documents ready
                </div>
              </CollapsibleSection>
            )}

            {/* Pitfalls / Warnings Section */}
            {step.pitfalls && step.pitfalls.length > 0 && (
              <div className="mt-5 space-y-3">
                <h4 className="text-sm font-bold text-red-300 flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  Common Pitfalls & Warnings
                </h4>
                {step.pitfalls.map((pitfall, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border-l-4 ${getSeverityColor(pitfall.severity)}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="font-semibold text-sm">{pitfall.title}</h5>
                      <span className={`px-2 py-0.5 text-xs rounded capitalize ${
                        pitfall.severity === 'common' ? 'bg-red-500/30 text-red-200' :
                        pitfall.severity === 'occasional' ? 'bg-orange-500/30 text-orange-200' :
                        'bg-yellow-500/30 text-yellow-200'
                      }`}>
                        {pitfall.severity}
                      </span>
                    </div>
                    <p className="text-sm mt-1 opacity-90">{pitfall.description}</p>
                    <div className="mt-2 pt-2 border-t border-white/10">
                      <p className="text-sm">
                        <span className="font-medium text-emerald-300">✓ Prevention:</span>{' '}
                        <span className="text-slate-300">{pitfall.prevention}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Status buttons with gradient effects */}
            <div className="mt-5 flex flex-wrap gap-2">
              {(['pending', 'in-progress', 'complete'] as RoadmapStepStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => onStatusChange(status)}
                  className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                    step.status === status
                      ? status === 'complete'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                        : status === 'in-progress'
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                        : 'bg-slate-700 text-slate-200'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 hover:shadow-md'
                  }`}
                >
                  <span className="mr-1.5">{statusIcons[status]}</span>
                  {status === 'pending' ? 'Not Started' : status === 'in-progress' ? 'In Progress' : 'Complete'}
                </button>
              ))}
            </div>

            {/* Tips with enhanced styling */}
            {step.tips && step.tips.length > 0 && (
              <div className="mt-5 p-4 bg-gradient-to-br from-amber-900/30 to-slate-800 rounded-xl border border-amber-500/30">
                <h4 className="text-sm font-bold text-amber-300 mb-3 flex items-center gap-2">
                  <span className="text-lg">💡</span>
                  {t('tips')}
                </h4>
                <ul className="space-y-2">
                  {step.tips.map((tip, idx) => (
                    <li key={idx} className="text-sm text-amber-100/80 flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Verified Sources Section (Collapsible) */}
            {step.verifiedSources && step.verifiedSources.length > 0 && (
              <CollapsibleSection
                title={`Verified Sources (${step.verifiedSources.length})`}
                icon="🔗"
                defaultOpen={false}
                className="bg-slate-800/50 border-slate-700"
              >
                <div className="mt-3 space-y-3">
                  {step.verifiedSources.map((source, idx) => {
                    const badge = getSourceTypeBadge(source.type);
                    return (
                      <div key={idx} className="p-3 bg-slate-700/50 rounded-lg">
                        <div className="flex items-start justify-between gap-2">
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="source-link text-sm font-medium text-orange-400 flex items-center gap-1.5"
                          >
                            <span>{source.title}</span>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                          <span className={`px-2 py-0.5 text-xs rounded ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>
                        </div>
                        {source.notes && (
                          <p className="text-xs text-slate-400 mt-1">{source.notes}</p>
                        )}
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Last verified: {source.lastVerified}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CollapsibleSection>
            )}

            {/* Legacy Sources (for backwards compatibility) */}
            {step.sources && step.sources.length > 0 && !step.verifiedSources && (
              <div className="mt-5 p-4 bg-gradient-to-br from-blue-900/30 to-slate-800 rounded-xl border border-blue-500/30">
                <h4 className="text-sm font-bold text-blue-300 mb-3 flex items-center gap-2">
                  <span className="text-lg">🔗</span>
                  Sources
                </h4>
                <ul className="space-y-2">
                  {step.sources.map((source, idx) => (
                    <li key={idx} className="text-sm">
                      {source.url ? (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="source-link inline-flex items-center gap-1.5 text-orange-400 font-medium"
                        >
                          <span>{source.label}</span>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ) : (
                        <span className="text-slate-400">{source.label}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Country-Specific Notes */}
            {step.countrySpecificNotes && Object.keys(step.countrySpecificNotes).length > 0 && (
              <CollapsibleSection
                title="Country-Specific Notes"
                icon="🌍"
                defaultOpen={false}
                className="bg-slate-800/50 border-slate-700"
              >
                <div className="mt-3 space-y-2">
                  {Object.entries(step.countrySpecificNotes).map(([code, note]) => (
                    <div key={code} className="flex items-start gap-3 p-2 bg-slate-700/50 rounded-lg">
                      <span className="px-2 py-0.5 text-xs font-bold bg-slate-600 text-slate-200 rounded">
                        {code}
                      </span>
                      <p className="text-sm text-slate-300">{note}</p>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Notes with elegant textarea */}
            <div className="mt-5">
              <h4 className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                <span className="text-lg">📝</span>
                {t('notes')}
              </h4>
              <textarea
                value={step.notes || ''}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="Add your notes, appointment dates, reference numbers..."
                className="w-full px-4 py-3 text-sm bg-slate-800/50 border-2 border-slate-700 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 resize-none"
                rows={2}
              />
            </div>

            {/* Completed timestamp with celebration */}
            {step.completedAt && (
              <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20">
                <span>🎉</span>
                <span className="font-medium">Completed: {new Date(step.completedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
