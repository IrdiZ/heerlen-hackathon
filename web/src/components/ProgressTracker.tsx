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
    <>
      {/* Global animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes gradient-flow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes celebration-bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.1); }
        }
        @keyframes confetti-fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100px) rotate(720deg); opacity: 0; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.3); }
          50% { box-shadow: 0 0 40px rgba(34, 197, 94, 0.6); }
        }
        @keyframes timeline-draw {
          from { height: 0; }
          to { height: 100%; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        .shimmer-bar {
          position: relative;
          overflow: hidden;
        }
        .shimmer-bar::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          animation: shimmer 2s infinite;
        }
        .gradient-animate {
          background-size: 200% 200%;
          animation: gradient-flow 4s ease infinite;
        }
        .celebration-emoji {
          animation: celebration-bounce 1s ease-in-out infinite;
        }
        .pulse-complete {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .timeline-line {
          animation: timeline-draw 1s ease-out forwards;
        }
        .step-enter {
          animation: fade-in-up 0.5s ease-out forwards;
        }
        .floating {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      <div className="bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 rounded-3xl shadow-2xl shadow-blue-900/10 overflow-hidden border border-slate-200/50 backdrop-blur-sm">
        {/* Header with animated gradient */}
        <div className="relative px-8 py-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 gradient-animate text-white overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />
          </div>

          <div className="relative flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight">{roadmap.name}</h2>
              <p className="text-sm text-blue-100 mt-1 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 bg-white/20 rounded-full text-xs font-bold">
                  {completedCount}
                </span>
                <span>of {totalSteps} steps complete</span>
              </p>
            </div>
            <div className={`text-4xl font-black ${progress === 100 ? 'celebration-emoji' : 'floating'}`}>
              {progress === 100 ? '🎉' : `${progress}%`}
            </div>
          </div>

          {/* Progress bar with shimmer effect */}
          <div className="relative mt-6 h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className={`shimmer-bar h-full rounded-full transition-all duration-700 ease-out ${
                progress === 100
                  ? 'bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400'
                  : 'bg-gradient-to-r from-white via-blue-100 to-white'
              }`}
              style={{ width: `${progress}%` }}
            />
            {/* Progress milestones */}
            <div className="absolute inset-0 flex justify-between px-0.5">
              {[25, 50, 75].map((milestone) => (
                <div
                  key={milestone}
                  className={`w-0.5 h-full transition-colors duration-300 ${
                    progress >= milestone ? 'bg-white/40' : 'bg-white/10'
                  }`}
                  style={{ marginLeft: `${milestone - 0.25}%` }}
                />
              ))}
            </div>
          </div>

          {/* Step indicators */}
          <div className="relative mt-4 flex justify-between">
            {sortedSteps.map((step, index) => (
              <div
                key={step.id}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  step.status === 'complete'
                    ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50 scale-110'
                    : step.status === 'in-progress'
                    ? 'bg-yellow-400 animate-pulse shadow-lg shadow-yellow-400/50'
                    : 'bg-white/30'
                }`}
                title={`Step ${step.order}: ${step.title}`}
              />
            ))}
          </div>
        </div>

        {/* Next Action Card with enhanced styling */}
        {nextStep && (
          <div className="relative px-8 py-6 bg-gradient-to-r from-blue-50 via-indigo-50/50 to-purple-50/30 border-b border-blue-100/50 overflow-hidden">
            {/* Decorative gradient blob */}
            <div className="absolute -right-20 -top-20 w-40 h-40 bg-blue-200/30 rounded-full blur-3xl" />
            
            <div className="relative">
              <div className="flex items-center gap-2 text-sm font-bold text-blue-600 mb-3">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full">
                  🎯
                </span>
                <span className="uppercase tracking-wider text-xs">{t('nextAction')}</span>
              </div>
              <h3 className="font-bold text-lg text-slate-900">{nextStep.title}</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">{nextStep.description}</p>
              {nextStep.estimatedTime && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-white/80 rounded-full shadow-sm">
                  <span>⏱️</span>
                  <span className="text-xs font-medium text-slate-600">{nextStep.estimatedTime}</span>
                </div>
              )}
              {nextStep.status === 'pending' && (
                <button
                  onClick={() => onSetStatus(nextStep.id, 'in-progress')}
                  className="mt-4 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
                >
                  🚀 Start This Step
                </button>
              )}
            </div>
          </div>
        )}

        {/* All steps complete celebration */}
        {!nextStep && totalSteps > 0 && (
          <div className="relative px-8 py-10 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border-b border-emerald-100/50 text-center overflow-hidden pulse-complete">
            {/* Confetti decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {['🎉', '🎊', '✨', '⭐', '🌟', '💫'].map((emoji, i) => (
                <span
                  key={i}
                  className="absolute text-2xl"
                  style={{
                    left: `${10 + i * 15}%`,
                    animation: `confetti-fall ${2 + i * 0.3}s ease-in-out ${i * 0.2}s infinite`,
                  }}
                >
                  {emoji}
                </span>
              ))}
            </div>
            
            <div className="relative">
              <div className="text-6xl mb-4 celebration-emoji">🎉</div>
              <h3 className="font-bold text-xl text-emerald-800">All steps completed!</h3>
              <p className="text-sm text-emerald-600 mt-2 max-w-md mx-auto">
                Congratulations on completing your immigration journey. You did it! 🌟
              </p>
            </div>
          </div>
        )}

        {/* Timeline steps list */}
        <div className="relative p-8">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Timeline
          </h3>
          
          {/* Timeline container with connecting line */}
          <div className="relative">
            {/* Animated timeline line */}
            <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-slate-200 to-emerald-200 rounded-full timeline-line" />
            
            {/* Steps with staggered animation */}
            <div className="space-y-4">
              {sortedSteps.map((step, index) => (
                <div
                  key={step.id}
                  className="step-enter relative"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Timeline node */}
                  <div
                    className={`absolute left-0 w-[46px] h-[46px] flex items-center justify-center z-10 ${
                      step.status === 'complete'
                        ? 'text-emerald-500'
                        : step.status === 'in-progress'
                        ? 'text-blue-500'
                        : 'text-slate-300'
                    }`}
                  >
                    {/* Connector dot - hidden, actual styling in card */}
                  </div>
                  
                  {/* Card wrapper for timeline offset */}
                  <div className="ml-0">
                    <RoadmapStepCard
                      step={step}
                      isNext={nextStep?.id === step.id}
                      onStatusChange={(status) => onSetStatus(step.id, status)}
                      onNotesChange={(notes) => onUpdateNotes(step.id, notes)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer with elegant styling */}
        <div className="px-8 py-5 bg-gradient-to-r from-slate-50 to-slate-100/50 border-t border-slate-200/50">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Created: {new Date(roadmap.createdAt).toLocaleDateString()}
            </p>

            {showConfirmClear ? (
              <div className="flex items-center gap-3 bg-red-50 px-4 py-2 rounded-xl border border-red-100">
                <span className="text-sm font-medium text-red-600">Clear roadmap?</span>
                <button
                  onClick={handleClear}
                  className="px-3 py-1.5 text-sm font-bold bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg hover:from-red-600 hover:to-rose-600 transform hover:scale-105 active:scale-95 transition-all shadow-lg shadow-red-500/20"
                >
                  Yes, clear
                </button>
                <button
                  onClick={() => setShowConfirmClear(false)}
                  className="px-3 py-1.5 text-sm font-medium bg-white text-slate-600 rounded-lg hover:bg-slate-100 transition-all border border-slate-200"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmClear(true)}
                className="text-sm text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1.5 group"
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {t('clear')}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
