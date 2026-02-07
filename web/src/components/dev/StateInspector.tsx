'use client';

import { useState } from 'react';

interface StateInspectorProps {
  piiData?: Record<string, unknown>;
  formSchema?: Record<string, unknown> | null;
  lastFillResults?: unknown[];
}

export function StateInspector({ piiData, formSchema, lastFillResults }: StateInspectorProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    pii: true,
    schema: false,
    results: false,
  });

  const toggle = (key: string) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  const sections = [
    { key: 'pii', label: '🔒 PII Data', data: piiData },
    { key: 'schema', label: '📋 Form Schema', data: formSchema },
    { key: 'results', label: '✅ Fill Results', data: lastFillResults },
  ];

  return (
    <div className="h-full overflow-auto p-3 space-y-3">
      {sections.map(section => (
        <div key={section.key} className="bg-gray-800 rounded-lg overflow-hidden">
          <button
            onClick={() => toggle(section.key)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            <span>{section.label}</span>
            <span className="text-gray-500">{expanded[section.key] ? '▼' : '▶'}</span>
          </button>
          
          {expanded[section.key] && (
            <div className="px-3 pb-3">
              {section.data ? (
                <pre className="text-xs text-gray-300 overflow-x-auto bg-gray-900 rounded p-2 max-h-48">
                  {JSON.stringify(section.data, null, 2)}
                </pre>
              ) : (
                <div className="text-xs text-gray-500 italic">No data</div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
