'use client';

import { useDevPanelContext } from '@/contexts/DevPanelContext';

export function FeatureFlags() {
  const { debugMode, verboseLogging, setDebugMode, setVerboseLogging } = useDevPanelContext();

  const flags = [
    { label: '🐛 Debug', value: debugMode, onChange: setDebugMode },
    { label: '📢 Verbose', value: verboseLogging, onChange: setVerboseLogging },
  ];

  return (
    <div className="flex items-center gap-4">
      {flags.map(flag => (
        <label key={flag.label} className="flex items-center gap-2 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={flag.value}
            onChange={e => flag.onChange(e.target.checked)}
            className="rounded bg-gray-700 border-gray-600"
          />
          <span className="text-gray-300">{flag.label}</span>
        </label>
      ))}
    </div>
  );
}
