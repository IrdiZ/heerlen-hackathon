'use client';

import { useState, useEffect } from 'react';
import { DevPanelProvider, useDevPanelContext } from '@/contexts/DevPanelContext';
import { CreditsDisplay } from './CreditsDisplay';
import { ConnectionStatusPanel } from './ConnectionStatusPanel';
import { LiveConsole } from './LiveConsole';
import { StateInspector } from './StateInspector';
import { QuickActions } from './QuickActions';
import { FeatureFlags } from './FeatureFlags';
import { patchConsole } from '@/lib/console-capture';

interface DevPanelProps {
  piiData?: Record<string, unknown>;
  formSchema?: Record<string, unknown> | null;
  lastFillResults?: unknown[];
  voiceAgentStatus?: 'disconnected' | 'connecting' | 'connected';
  extensionConnected?: boolean;
}

function DevPanelInner({ piiData, formSchema, lastFillResults, voiceAgentStatus, extensionConnected }: DevPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'console' | 'state'>('console');
  const { 
    addConsoleEntry, 
    refreshCredits,
    setVoiceAgentStatus,
    setExtensionConnected: setExtensionConnectedCtx 
  } = useDevPanelContext();

  // Sync props to context
  useEffect(() => {
    if (voiceAgentStatus) setVoiceAgentStatus(voiceAgentStatus);
  }, [voiceAgentStatus, setVoiceAgentStatus]);

  useEffect(() => {
    if (extensionConnected !== undefined) setExtensionConnectedCtx(extensionConnected);
  }, [extensionConnected, setExtensionConnectedCtx]);

  // Check if we should show (dev mode OR ?debug=1)
  const [shouldShow, setShouldShow] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDev = process.env.NODE_ENV === 'development';
      const hasDebugParam = new URLSearchParams(window.location.search).get('debug') === '1';
      setShouldShow(isDev || hasDebugParam);
      
      const stored = localStorage.getItem('devpanel_open');
      if (stored === 'true') setIsOpen(true);
    }
  }, []);

  // Persist open state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('devpanel_open', String(isOpen));
    }
  }, [isOpen]);

  // Keyboard shortcut: Ctrl+Shift+D
  useEffect(() => {
    if (!shouldShow) return;
    
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shouldShow]);

  // Patch console on mount
  useEffect(() => {
    if (!shouldShow) return;
    
    patchConsole((level, args, source) => {
      addConsoleEntry({
        timestamp: new Date(),
        level,
        args,
        source,
      });
    });
  }, [shouldShow, addConsoleEntry]);

  // Poll credits every 30s when open
  useEffect(() => {
    if (!isOpen) return;
    
    refreshCredits();
    const interval = setInterval(refreshCredits, 30000);
    return () => clearInterval(interval);
  }, [isOpen, refreshCredits]);

  if (!shouldShow) return null;

  const tabs = [
    { id: 'console', label: '📝 Console' },
    { id: 'state', label: '🔍 State' },
  ] as const;

  return (
    <>
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-gray-800 transition-colors text-sm font-mono border border-gray-700"
          title="Open DevPanel (Ctrl+Shift+D)"
        >
          🛠️ Dev
        </button>
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-gray-900 text-gray-100 shadow-2xl z-50 transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">🛠️</span>
            <span className="font-semibold">DevPanel</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-mono">Ctrl+Shift+D</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Credits + Connection Status */}
        <div className="px-4 py-3 bg-gray-800/50 border-b border-gray-700 space-y-2 shrink-0">
          <CreditsDisplay />
          <ConnectionStatusPanel />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-gray-800 text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'console' && <LiveConsole />}
          {activeTab === 'state' && (
            <StateInspector
              piiData={piiData}
              formSchema={formSchema}
              lastFillResults={lastFillResults}
            />
          )}
        </div>

        {/* Bottom Actions */}
        <div className="bg-gray-800 border-t border-gray-700 shrink-0">
          <div className="px-4 py-2">
            <FeatureFlags />
          </div>
          <div className="px-4 py-2 border-t border-gray-700">
            <QuickActions />
          </div>
        </div>
      </div>

      {/* Backdrop (mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

// Wrapped with provider
export function DevPanel(props: DevPanelProps) {
  return (
    <DevPanelProvider>
      <DevPanelInner {...props} />
    </DevPanelProvider>
  );
}
