'use client';

import { useDevPanelContext } from '@/contexts/DevPanelContext';

export function ConnectionStatusPanel() {
  const { voiceAgentStatus, extensionConnected } = useDevPanelContext();

  const statuses = [
    {
      label: 'Voice',
      status: voiceAgentStatus,
      color: voiceAgentStatus === 'connected' ? 'bg-green-500' :
             voiceAgentStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
             'bg-gray-500',
    },
    {
      label: 'Extension',
      status: extensionConnected ? 'connected' : 'disconnected',
      color: extensionConnected ? 'bg-green-500' : 'bg-gray-500',
    },
  ];

  return (
    <div className="flex items-center gap-4">
      {statuses.map(s => (
        <div key={s.label} className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${s.color}`} />
          <span className="text-xs text-gray-400">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
