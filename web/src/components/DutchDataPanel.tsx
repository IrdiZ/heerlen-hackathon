'use client';

import { useState } from 'react';
import { VehicleLookup } from './VehicleLookup';
import { RegionalStats, RegionalTip } from './RegionalStats';

type ActivePanel = 'none' | 'vehicle' | 'stats';

interface DutchDataPanelProps {
  defaultRegion?: string;
  compact?: boolean;
}

export function DutchDataPanel({ defaultRegion = 'Heerlen', compact = false }: DutchDataPanelProps) {
  const [activePanel, setActivePanel] = useState<ActivePanel>('none');

  const togglePanel = (panel: ActivePanel) => {
    setActivePanel(current => current === panel ? 'none' : panel);
  };

  if (compact) {
    return (
      <div className="space-y-3">
        {/* Regional tip as a teaser */}
        <RegionalTip regionName={defaultRegion} />
        
        {/* Quick action buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => togglePanel('vehicle')}
            className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              activePanel === 'vehicle'
                ? 'bg-orange-100 text-orange-700 border-2 border-orange-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
            }`}
          >
            <span>🚗</span>
            <span>Vehicle Check</span>
          </button>
          <button
            onClick={() => togglePanel('stats')}
            className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              activePanel === 'stats'
                ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
            }`}
          >
            <span>📊</span>
            <span>Cost of Living</span>
          </button>
        </div>

        {/* Panels */}
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
          activePanel !== 'none' ? 'opacity-100 max-h-[2000px]' : 'opacity-0 max-h-0'
        }`}>
          {activePanel === 'vehicle' && (
            <VehicleLookup onClose={() => setActivePanel('none')} />
          )}
          {activePanel === 'stats' && (
            <RegionalStats
              regionName={defaultRegion}
              onClose={() => setActivePanel('none')}
            />
          )}
        </div>
      </div>
    );
  }

  // Full-size panel layout
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-3">
        <div className="flex items-center gap-2 text-white">
          <span className="text-xl">🇳🇱</span>
          <h3 className="font-semibold">Dutch Open Data</h3>
        </div>
        <p className="text-gray-300 text-sm mt-1">
          Access public government data to help with your move
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActivePanel(activePanel === 'vehicle' ? 'none' : 'vehicle')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            activePanel === 'vehicle'
              ? 'bg-orange-50 text-orange-700 border-b-2 border-orange-500'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <span>🚗</span>
          <span>RDW Vehicle Lookup</span>
        </button>
        <button
          onClick={() => setActivePanel(activePanel === 'stats' ? 'none' : 'stats')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            activePanel === 'stats'
              ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <span>📊</span>
          <span>CBS Statistics</span>
        </button>
      </div>

      {/* Content */}
      <div className={`transition-all duration-300 ease-in-out ${
        activePanel === 'none' ? 'p-6' : ''
      }`}>
        {activePanel === 'none' && (
          <div className="text-center text-gray-500">
            <span className="text-4xl mb-3 block">🔍</span>
            <p className="font-medium">Choose a data source above</p>
            <p className="text-sm mt-1">
              Check vehicle APK status or explore regional cost of living
            </p>
          </div>
        )}
        
        {activePanel === 'vehicle' && (
          <VehicleLookup />
        )}
        
        {activePanel === 'stats' && (
          <RegionalStats regionName={defaultRegion} />
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">
          Data sourced from RDW and CBS open data portals • Free and public access
        </p>
      </div>
    </div>
  );
}

export default DutchDataPanel;
