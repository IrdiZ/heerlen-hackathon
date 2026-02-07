'use client';

interface QuickStartGuideProps {
  onDismiss: () => void;
}

export function QuickStartGuide({ onDismiss }: QuickStartGuideProps) {
  const steps = [
    {
      emoji: '🎤',
      title: 'Start talking',
      desc: 'Click the button and speak in your language',
    },
    {
      emoji: '📝',
      title: 'Fill your details',
      desc: 'Enter personal info in the secure form (stays local)',
    },
    {
      emoji: '📋',
      title: 'Capture a form',
      desc: 'Navigate to a Dutch form, click "Capture" in extension',
    },
    {
      emoji: '✨',
      title: 'Auto-fill',
      desc: 'AI maps your data to the form fields automatically',
    },
  ];

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-blue-800">Quick Start</h3>
        <button
          onClick={onDismiss}
          className="text-blue-400 hover:text-blue-600 text-sm"
        >
          Dismiss
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {steps.map((step, i) => (
          <div key={i} className="text-center">
            <div className="text-2xl mb-1">{step.emoji}</div>
            <div className="text-sm font-medium text-blue-800">{step.title}</div>
            <div className="text-xs text-blue-600">{step.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
