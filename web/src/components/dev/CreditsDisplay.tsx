'use client';

import { useDevPanelContext } from '@/contexts/DevPanelContext';

export function CreditsDisplay() {
  const { credits, creditsLoading, creditsError, refreshCredits } = useDevPanelContext();

  const percentage = credits ? (credits.remaining / credits.total) * 100 : 0;
  const barColor = percentage > 50 ? 'bg-green-500' : percentage > 20 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400 whitespace-nowrap">💳 Credits:</span>
      
      {creditsLoading && !credits && (
        <span className="text-xs text-gray-500 animate-pulse">Loading...</span>
      )}
      
      {creditsError && (
        <span className="text-xs text-red-400 truncate" title={creditsError}>
          ❌ {creditsError.slice(0, 20)}...
        </span>
      )}
      
      {credits && (
        <div className="flex-1 flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full ${barColor} transition-all duration-300`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-xs font-mono text-gray-300 whitespace-nowrap">
            {credits.remaining.toLocaleString()}
          </span>
        </div>
      )}
      
      <button
        onClick={refreshCredits}
        disabled={creditsLoading}
        className="text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
        title="Refresh credits"
      >
        🔄
      </button>
    </div>
  );
}
