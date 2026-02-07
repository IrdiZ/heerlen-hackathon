'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useChecklist, ChecklistState } from '@/hooks/useChecklist';
import {
  IMMIGRATION_STEPS,
  getStepsByOrder,
  StepStatus,
  ImmigrationStep,
} from '@/lib/immigration-steps';

// Confetti particle interface
interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  velocityX: number;
  velocityY: number;
}

// Confetti component
function Confetti({ active, onComplete }: { active: boolean; onComplete: () => void }) {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);
  const animationRef = useRef<number>(undefined);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const colors = ['#f97316', '#22c55e', '#3b82f6', '#eab308', '#ec4899', '#8b5cf6'];
    const newParticles: ConfettiParticle[] = [];
    
    for (let i = 0; i < 100; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 20,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 8 + Math.random() * 8,
        velocityX: (Math.random() - 0.5) * 3,
        velocityY: 2 + Math.random() * 3,
      });
    }
    
    setParticles(newParticles);

    let frame = 0;
    const animate = () => {
      frame++;
      setParticles(prev => 
        prev.map(p => ({
          ...p,
          y: p.y + p.velocityY,
          x: p.x + p.velocityX,
          rotation: p.rotation + 5,
          velocityY: p.velocityY + 0.1,
        })).filter(p => p.y < 120)
      );

      if (frame < 180) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [active, onComplete]);

  if (!active || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg)`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0%',
          }}
        />
      ))}
    </div>
  );
}

// Timeline step component
function TimelineStep({
  step,
  status,
  isNext,
  isLast,
  completedAt,
  onStatusChange,
  stepNumber,
}: {
  step: ImmigrationStep;
  status: StepStatus;
  isNext: boolean;
  isLast: boolean;
  completedAt?: string;
  onStatusChange: (status: StepStatus) => void;
  stepNumber: number;
}) {
  const [isExpanded, setIsExpanded] = useState(isNext);

  const statusConfig = {
    pending: {
      bgColor: 'bg-gray-200',
      borderColor: 'border-gray-300',
      textColor: 'text-gray-500',
      icon: '○',
      label: 'Not Started',
    },
    'in-progress': {
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-400',
      textColor: 'text-yellow-700',
      icon: '◐',
      label: 'In Progress',
    },
    complete: {
      bgColor: 'bg-green-100',
      borderColor: 'border-green-500',
      textColor: 'text-green-700',
      icon: '✓',
      label: 'Complete',
    },
  };

  const config = statusConfig[status];

  return (
    <div className="relative flex gap-4">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        {/* Node */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-3 ${config.bgColor} ${config.borderColor} ${config.textColor} ${
            isNext ? 'ring-4 ring-orange-300 ring-offset-2' : ''
          } transition-all duration-300`}
        >
          {status === 'complete' ? '✓' : stepNumber}
        </div>
        {/* Connector line */}
        {!isLast && (
          <div
            className={`w-1 flex-1 min-h-[40px] ${
              status === 'complete' ? 'bg-green-400' : 'bg-gray-200'
            } transition-colors duration-300`}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
            config.bgColor
          } ${config.borderColor} ${isNext ? 'shadow-lg' : ''}`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-800">{step.title}</h3>
                {isNext && (
                  <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                    Next Step
                  </span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full ${config.bgColor} ${config.textColor} border ${config.borderColor}`}>
                  {config.label}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                ⏱️ {step.estimatedTime}
              </p>
              {completedAt && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ Completed {new Date(completedAt).toLocaleDateString()}
                </p>
              )}
            </div>
            <span className="text-gray-400 text-xl flex-shrink-0">
              {isExpanded ? '−' : '+'}
            </span>
          </div>
        </button>

        {/* Expanded content */}
        {isExpanded && (
          <div className="mt-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm space-y-4 animate-fade-in">
            <p className="text-gray-600">{step.description}</p>

            {/* Status buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onStatusChange('pending')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  status === 'pending'
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Not Started
              </button>
              <button
                onClick={() => onStatusChange('in-progress')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  status === 'in-progress'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                }`}
              >
                In Progress
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
              <h4 className="font-medium text-gray-800 mb-2">📄 Required Documents</h4>
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
          </div>
        )}
      </div>
    </div>
  );
}

// Next actions component
function NextActions({ nextStep, progress }: { nextStep: ImmigrationStep | undefined; progress: number }) {
  if (progress === 100) {
    return (
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
        <h3 className="text-xl font-bold mb-2">🎉 Congratulations!</h3>
        <p>You&apos;ve completed all the essential immigration steps. Welcome to the Netherlands!</p>
        <p className="mt-3 text-green-100 text-sm">
          Remember to keep your documents safe and stay on top of annual renewals (insurance, tax returns, etc.)
        </p>
      </div>
    );
  }

  if (!nextStep) return null;

  // Calculate suggested deadline based on step
  const getDeadline = (stepId: string): string => {
    const deadlines: Record<string, string> = {
      'gemeente-registration': 'Within 5 days of arrival',
      'bsn-number': 'Same day as gemeente registration',
      'bank-account': 'Within 2 weeks of BSN',
      'health-insurance': 'Within 4 months of registration',
      'digid': 'Within 2 weeks of BSN',
      'tax-registration': 'Before first paycheck',
      'zorgtoeslag': 'Within 3 months of health insurance',
    };
    return deadlines[stepId] || 'As soon as possible';
  };

  return (
    <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-6 text-white">
      <h3 className="text-xl font-bold mb-3">📋 Next Action</h3>
      <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
        <h4 className="font-semibold text-lg">{nextStep.title}</h4>
        <p className="text-orange-100 text-sm mt-1">{nextStep.description.slice(0, 150)}...</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="bg-white/30 rounded-full px-3 py-1 text-sm">
            ⏱️ {nextStep.estimatedTime}
          </span>
          <span className="bg-white/30 rounded-full px-3 py-1 text-sm">
            📅 {getDeadline(nextStep.id)}
          </span>
        </div>
      </div>
      <p className="mt-4 text-orange-100 text-sm">
        📄 Prepare: {nextStep.requiredDocuments.slice(0, 2).join(', ')}
        {nextStep.requiredDocuments.length > 2 && ` +${nextStep.requiredDocuments.length - 2} more`}
      </p>
    </div>
  );
}

// Import/Export component
function ImportExport({
  checklist,
  onImport,
}: {
  checklist: ChecklistState;
  onImport: (data: ChecklistState) => void;
}) {
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const exportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      checklist,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `migrantai-progress-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.checklist) {
          onImport(data.checklist);
          setShowImport(false);
          setImportError('');
        } else {
          setImportError('Invalid file format');
        }
      } catch {
        setImportError('Failed to parse file');
      }
    };
    reader.readAsText(file);
  };

  const handleTextImport = () => {
    try {
      const data = JSON.parse(importText);
      if (data.checklist) {
        onImport(data.checklist);
        setShowImport(false);
        setImportText('');
        setImportError('');
      } else {
        setImportError('Invalid format: missing checklist data');
      }
    } catch {
      setImportError('Invalid JSON format');
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={handleExport}
        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium flex items-center gap-2"
      >
        📤 Export Progress
      </button>
      <button
        onClick={() => setShowImport(!showImport)}
        className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium flex items-center gap-2"
      >
        📥 Import Progress
      </button>

      {showImport && (
        <div className="w-full mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Import from file:
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
            />
          </div>
          <div className="border-t pt-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or paste JSON:
            </label>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder='Paste exported JSON here...'
              className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              rows={4}
            />
            <button
              onClick={handleTextImport}
              disabled={!importText.trim()}
              className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              Import
            </button>
          </div>
          {importError && (
            <p className="text-red-600 text-sm">{importError}</p>
          )}
        </div>
      )}
    </div>
  );
}

// Main Progress Dashboard
export default function ProgressDashboard() {
  const {
    checklist,
    isLoaded,
    getProgress,
    getCompletedCount,
    getNextStep,
    getStatus,
    updateStatus,
    importChecklist,
    totalSteps,
  } = useChecklist();

  const [showConfetti, setShowConfetti] = useState(false);
  const [celebratedMilestones, setCelebratedMilestones] = useState<Set<number>>(new Set());
  const prevProgressRef = useRef<number>(0);

  // Calculate estimated total time
  const estimateTotalTime = (): string => {
    const orderedSteps = getStepsByOrder();
    const remainingSteps = orderedSteps.filter(s => getStatus(s.id) !== 'complete');
    if (remainingSteps.length === 0) return 'Done! 🎉';
    
    // Rough estimate: 1-2 weeks per major step
    const weeksRemaining = remainingSteps.length * 1.5;
    if (weeksRemaining < 1) return 'Less than a week';
    if (weeksRemaining <= 2) return 'About 2 weeks';
    if (weeksRemaining <= 4) return 'About a month';
    return `About ${Math.ceil(weeksRemaining / 4)} months`;
  };

  // Handle status change with celebration
  const handleStatusChange = useCallback((stepId: string, status: StepStatus) => {
    updateStatus(stepId, status);
  }, [updateStatus]);

  // Import handler
  const handleImport = useCallback((data: ChecklistState) => {
    importChecklist(data);
  }, [importChecklist]);

  // Celebration effect for milestones
  useEffect(() => {
    if (!isLoaded) return;

    const progress = getProgress();
    const milestones = [25, 50, 75, 100];

    for (const milestone of milestones) {
      if (progress >= milestone && prevProgressRef.current < milestone && !celebratedMilestones.has(milestone)) {
        setShowConfetti(true);
        setCelebratedMilestones(prev => new Set([...prev, milestone]));
        break;
      }
    }

    prevProgressRef.current = progress;
  }, [isLoaded, getProgress, celebratedMilestones]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto animate-pulse space-y-6">
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

  const progress = getProgress();
  const completedCount = getCompletedCount();
  const nextStep = getNextStep();
  const orderedSteps = getStepsByOrder();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 animate-fade-in">
      {/* Confetti celebration */}
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b px-4 sm:px-6 py-4 shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🇳🇱</span>
            <h1 className="text-xl font-bold text-gray-800">Immigration Progress</h1>
          </div>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
          >
            ← Back to MigrantAI
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-8">
        {/* Progress Overview */}
        <section className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Your Journey</h2>
              <p className="text-gray-500">
                {completedCount} of {totalSteps} steps complete
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-orange-600">{progress}%</div>
              <p className="text-sm text-gray-500">⏱️ {estimateTotalTime()} remaining</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-400 via-orange-500 to-green-500 rounded-full transition-all duration-700 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                {progress > 10 && (
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white text-xs font-bold">
                    {progress}%
                  </span>
                )}
              </div>
            </div>
            {/* Milestone markers */}
            <div className="absolute top-0 left-0 right-0 h-6 flex justify-between px-1 pointer-events-none">
              {[25, 50, 75].map(milestone => (
                <div
                  key={milestone}
                  className="flex flex-col items-center"
                  style={{ position: 'absolute', left: `${milestone}%`, transform: 'translateX(-50%)' }}
                >
                  <div className={`w-1 h-6 ${progress >= milestone ? 'bg-white/50' : 'bg-gray-400'}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Milestone labels */}
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Start</span>
            <span style={{ marginLeft: '20%' }}>25%</span>
            <span>50%</span>
            <span style={{ marginRight: '20%' }}>75%</span>
            <span>Done!</span>
          </div>
        </section>

        {/* Next Actions */}
        <section>
          <NextActions nextStep={nextStep} progress={progress} />
        </section>

        {/* Timeline */}
        <section className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">📍 Immigration Timeline</h2>
          <p className="text-gray-500 mb-6 text-sm">
            arrive → register → BSN → bank → insurance → DigiD → tax → zorgtoeslag
          </p>

          <div className="space-y-0">
            {orderedSteps.map((step, index) => (
              <TimelineStep
                key={step.id}
                step={step}
                status={getStatus(step.id)}
                isNext={nextStep?.id === step.id}
                isLast={index === orderedSteps.length - 1}
                completedAt={checklist[step.id]?.completedAt}
                onStatusChange={(status) => handleStatusChange(step.id, status)}
                stepNumber={index + 1}
              />
            ))}
          </div>
        </section>

        {/* Import/Export */}
        <section className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">💾 Backup & Restore</h2>
          <p className="text-gray-500 text-sm mb-4">
            Export your progress to save it, or import from a previous backup.
          </p>
          <ImportExport checklist={checklist} onImport={handleImport} />
        </section>

        {/* Celebration button (for testing) */}
        {process.env.NODE_ENV === 'development' && (
          <section className="text-center">
            <button
              onClick={() => setShowConfetti(true)}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              🎉 Test Confetti
            </button>
          </section>
        )}
      </div>
    </main>
  );
}
