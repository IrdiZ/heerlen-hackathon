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
    'complete': '✓',
  };

  const statusColors: Record<RoadmapStepStatus, string> = {
    'pending': 'text-slate-400',
    'in-progress': 'text-blue-500',
    'complete': 'text-emerald-500',
  };

  const statusBgColors: Record<RoadmapStepStatus, string> = {
    'pending': 'bg-slate-100 hover:bg-slate-200',
    'in-progress': 'bg-blue-100 hover:bg-blue-200',
    'complete': 'bg-emerald-100 hover:bg-emerald-200',
  };

  const statusRingColors: Record<RoadmapStepStatus, string> = {
    'pending': 'ring-slate-300',
    'in-progress': 'ring-blue-400',
    'complete': 'ring-emerald-400',
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
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); }
          70% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.5); }
        }
        @keyframes slide-down {
          from { opacity: 0; max-height: 0; transform: translateY(-10px); }
          to { opacity: 1; max-height: 1000px; transform: translateY(0); }
        }
        @keyframes confetti-burst {
          0% { transform: scale(0); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
          100% { transform: scale(1); opacity: 0; }
        }
        @keyframes float-up {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-20px) rotate(180deg); opacity: 0; }
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
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          transition: width 0.3s ease;
        }
        .source-link:hover::after {
          width: 100%;
        }
        .source-link:hover {
          color: #6366f1;
        }
      `}</style>

      <div
        className={`card-hover relative rounded-2xl overflow-hidden backdrop-blur-sm border-2 transition-all duration-300 ${
          isNext && step.status !== 'complete'
            ? 'next-card border-blue-400/50 bg-gradient-to-br from-white via-blue-50/50 to-indigo-50/30 shadow-xl shadow-blue-500/10'
            : step.status === 'complete'
            ? 'border-emerald-200/50 bg-gradient-to-br from-emerald-50/80 to-white shadow-lg shadow-emerald-500/5'
            : 'border-slate-200/50 bg-white/80 shadow-md hover:shadow-xl hover:border-slate-300/50'
        }`}
      >
        {/* Decorative gradient overlay for next step */}
        {isNext && step.status !== 'complete' && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
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
          className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-white/50 transition-all duration-300 group"
        >
          {/* Status icon with ring effect */}
          <div className="relative">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ring-2 ${statusRingColors[step.status]} transition-all duration-300 ${
                step.status === 'complete'
                  ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white'
                  : step.status === 'in-progress'
                  ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white'
                  : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
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
              <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-30" />
            )}
          </div>

          {/* Step number and title */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Step {step.order}
              </span>
              {isNext && step.status !== 'complete' && (
                <span className="next-badge px-2.5 py-0.5 text-xs font-bold bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full shadow-lg shadow-blue-500/30">
                  Next
                </span>
              )}
              {step.status === 'in-progress' && (
                <span className="px-2.5 py-0.5 text-xs font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full animate-pulse">
                  In Progress
                </span>
              )}
            </div>
            <h3
              className={`font-semibold text-base transition-all duration-300 ${
                step.status === 'complete'
                  ? 'line-through text-slate-400 decoration-emerald-400 decoration-2'
                  : 'text-slate-800 group-hover:text-blue-600'
              }`}
            >
              {step.title}
            </h3>
          </div>

          {/* Expand indicator with smooth rotation */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 group-hover:bg-slate-200 transition-all duration-300 ${
              isExpanded ? 'rotate-180 bg-blue-100' : ''
            }`}
          >
            <svg
              className="w-4 h-4 text-slate-500 transition-colors group-hover:text-blue-500"
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
          <div className="expand-content px-5 pb-5 border-t border-slate-100/50">
            {/* Description */}
            <p className="mt-4 text-sm text-slate-600 leading-relaxed">{step.description}</p>

            {/* Estimated time with icon */}
            {step.estimatedTime && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 rounded-full">
                <span className="text-base">⏱️</span>
                <span className="text-xs font-medium text-slate-600">
                  {t('estimatedTime')}: {step.estimatedTime}
                </span>
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
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-slate-200 text-slate-700'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:shadow-md'
                  }`}
                >
                  <span className="mr-1.5">{statusIcons[status]}</span>
                  {status === 'pending' ? 'Not Started' : status === 'in-progress' ? 'In Progress' : 'Complete'}
                </button>
              ))}
            </div>

            {/* Tips with enhanced styling */}
            {step.tips && step.tips.length > 0 && (
              <div className="mt-5 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100/50">
                <h4 className="text-sm font-bold text-amber-800 mb-3 flex items-center gap-2">
                  <span className="text-lg">💡</span>
                  {t('tips')}
                </h4>
                <ul className="space-y-2">
                  {step.tips.map((tip, idx) => (
                    <li key={idx} className="text-sm text-amber-900/80 flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sources with hover effects */}
            {step.sources && step.sources.length > 0 && (
              <div className="mt-5 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100/50">
                <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
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
                          className="source-link inline-flex items-center gap-1.5 text-blue-600 font-medium"
                        >
                          <span>{source.label}</span>
                          <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ) : (
                        <span className="text-slate-600">{source.label}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Notes with elegant textarea */}
            <div className="mt-5">
              <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <span className="text-lg">📝</span>
                {t('notes')}
              </h4>
              <textarea
                value={step.notes || ''}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="Add your notes, appointment dates, reference numbers..."
                className="w-full px-4 py-3 text-sm bg-slate-50/50 border-2 border-slate-200/50 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 resize-none placeholder:text-slate-400"
                rows={2}
              />
            </div>

            {/* Completed timestamp with celebration */}
            {step.completedAt && (
              <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
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
