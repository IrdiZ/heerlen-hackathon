'use client';

import { useDevPanelContext } from '@/contexts/DevPanelContext';

export function QuickActions() {
  const { clearConsole } = useDevPanelContext();

  const actions = [
    {
      label: '🗑️ Clear All',
      onClick: () => {
        if (confirm('Clear all localStorage data?')) {
          localStorage.clear();
          window.location.reload();
        }
      },
    },
    {
      label: '🔄 Reload',
      onClick: () => window.location.reload(),
    },
    {
      label: '📝 Clear Logs',
      onClick: clearConsole,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map(action => (
        <button
          key={action.label}
          onClick={action.onClick}
          className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
