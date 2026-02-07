# Developer Panel Implementation Plan

## Overview
A collapsible developer panel for debugging the MigrantAI hackathon web app. Includes ElevenLabs credits display, connection status, live console, state inspector, quick actions, performance metrics, and feature flags.

---

## File Structure

```
src/
├── components/
│   └── dev/
│       ├── DevPanel.tsx           # Main panel container + keyboard shortcut
│       ├── CreditsDisplay.tsx     # ElevenLabs credits (polls every 30s)
│       ├── ConnectionStatus.tsx   # Voice agent, extension, WebSocket states
│       ├── LiveConsole.tsx        # Console.log intercept + tool calls
│       ├── StateInspector.tsx     # PII data, form schema, fill results
│       ├── QuickActions.tsx       # Clear state, reload, test tools
│       ├── PerformanceMetrics.tsx # Response times, latency
│       └── FeatureFlags.tsx       # Debug mode, verbose logging
├── hooks/
│   └── useDevPanel.ts             # State management for dev panel
├── lib/
│   └── console-capture.ts         # Console.log interceptor
└── contexts/
    └── DevPanelContext.tsx        # Global dev state (console logs, metrics)
```

---

## Design Decisions to Review

### 1. **Panel Position**
- **Option A:** Right side slide-out (like React DevTools)
- **Option B:** Bottom panel (like Chrome DevTools)
- **Recommendation:** Right side - less intrusive for form-heavy UI

### 2. **ElevenLabs Credits API**
- ElevenLabs API requires an API key (not just agent ID)
- Need `NEXT_PUBLIC_ELEVENLABS_API_KEY` or a backend proxy
- **Decision needed:** Expose API key client-side OR create `/api/credits` endpoint?
- **Recommendation:** Backend proxy at `/api/credits` for security

### 3. **Console Capture Strategy**
- Intercept `console.log/warn/error` globally
- Store in a ring buffer (last 500 entries)
- **Question:** Start capturing immediately or only when panel opens?
- **Recommendation:** Always capture (lightweight), only render when panel open

### 4. **Performance Metrics Source**
- No existing performance tracking in codebase
- Need to instrument: voice agent connection, form capture, form fill
- **Recommendation:** Wrap key functions with timing decorators

### 5. **Feature Flags Storage**
- localStorage for persistence
- Keys: `debug_mode`, `verbose_logging`, etc.
- **Recommendation:** Simple key-value in localStorage, no external service

---

## Implementation Details

### 1. DevPanelContext.tsx

```tsx
'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';

interface ConsoleEntry {
  id: number;
  timestamp: Date;
  level: 'log' | 'warn' | 'error' | 'info';
  args: unknown[];
  source?: string;
}

interface ToolCall {
  id: number;
  timestamp: Date;
  name: string;
  params: unknown;
  result?: unknown;
  duration?: number;
  status: 'pending' | 'success' | 'error';
}

interface PerformanceEntry {
  id: number;
  name: string;
  startTime: number;
  duration: number;
  metadata?: Record<string, unknown>;
}

interface DevPanelState {
  // Console
  consoleLogs: ConsoleEntry[];
  toolCalls: ToolCall[];
  
  // Performance
  metrics: PerformanceEntry[];
  
  // Feature flags
  debugMode: boolean;
  verboseLogging: boolean;
  
  // Connection states (mirrored from app)
  voiceAgentStatus: 'disconnected' | 'connecting' | 'connected';
  extensionConnected: boolean;
  
  // ElevenLabs
  credits: { remaining: number; total: number; } | null;
  creditsLoading: boolean;
  creditsError: string | null;
}

interface DevPanelContextValue extends DevPanelState {
  // Console
  addConsoleEntry: (entry: Omit<ConsoleEntry, 'id'>) => void;
  clearConsole: () => void;
  
  // Tool calls
  addToolCall: (call: Omit<ToolCall, 'id'>) => void;
  updateToolCall: (id: number, updates: Partial<ToolCall>) => void;
  
  // Performance
  startTimer: (name: string, metadata?: Record<string, unknown>) => number;
  endTimer: (id: number) => void;
  
  // Feature flags
  setDebugMode: (enabled: boolean) => void;
  setVerboseLogging: (enabled: boolean) => void;
  
  // Connection states
  setVoiceAgentStatus: (status: DevPanelState['voiceAgentStatus']) => void;
  setExtensionConnected: (connected: boolean) => void;
  
  // Credits
  refreshCredits: () => Promise<void>;
}

const DevPanelContext = createContext<DevPanelContextValue | null>(null);

export function useDevPanelContext() {
  const ctx = useContext(DevPanelContext);
  if (!ctx) throw new Error('useDevPanelContext must be used within DevPanelProvider');
  return ctx;
}

export function DevPanelProvider({ children }: { children: ReactNode }) {
  const [consoleLogs, setConsoleLogs] = useState<ConsoleEntry[]>([]);
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);
  const [metrics, setMetrics] = useState<PerformanceEntry[]>([]);
  const [debugMode, setDebugModeState] = useState(false);
  const [verboseLogging, setVerboseLoggingState] = useState(false);
  const [voiceAgentStatus, setVoiceAgentStatus] = useState<DevPanelState['voiceAgentStatus']>('disconnected');
  const [extensionConnected, setExtensionConnected] = useState(false);
  const [credits, setCredits] = useState<DevPanelState['credits']>(null);
  const [creditsLoading, setCreditsLoading] = useState(false);
  const [creditsError, setCreditsError] = useState<string | null>(null);
  
  const entryIdRef = useRef(0);
  const timerMapRef = useRef<Map<number, { name: string; startTime: number; metadata?: Record<string, unknown> }>>(new Map());

  // Load feature flags from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDebugModeState(localStorage.getItem('devpanel_debug_mode') === 'true');
      setVerboseLoggingState(localStorage.getItem('devpanel_verbose_logging') === 'true');
    }
  }, []);

  const addConsoleEntry = useCallback((entry: Omit<ConsoleEntry, 'id'>) => {
    setConsoleLogs(prev => {
      const newLogs = [...prev, { ...entry, id: ++entryIdRef.current }];
      return newLogs.slice(-500); // Keep last 500
    });
  }, []);

  const clearConsole = useCallback(() => setConsoleLogs([]), []);

  const addToolCall = useCallback((call: Omit<ToolCall, 'id'>) => {
    const id = ++entryIdRef.current;
    setToolCalls(prev => [...prev, { ...call, id }]);
    return id;
  }, []);

  const updateToolCall = useCallback((id: number, updates: Partial<ToolCall>) => {
    setToolCalls(prev => prev.map(tc => tc.id === id ? { ...tc, ...updates } : tc));
  }, []);

  const startTimer = useCallback((name: string, metadata?: Record<string, unknown>) => {
    const id = ++entryIdRef.current;
    timerMapRef.current.set(id, { name, startTime: performance.now(), metadata });
    return id;
  }, []);

  const endTimer = useCallback((id: number) => {
    const timer = timerMapRef.current.get(id);
    if (timer) {
      const duration = performance.now() - timer.startTime;
      setMetrics(prev => [...prev.slice(-100), {
        id,
        name: timer.name,
        startTime: timer.startTime,
        duration,
        metadata: timer.metadata,
      }]);
      timerMapRef.current.delete(id);
    }
  }, []);

  const setDebugMode = useCallback((enabled: boolean) => {
    setDebugModeState(enabled);
    localStorage.setItem('devpanel_debug_mode', String(enabled));
  }, []);

  const setVerboseLogging = useCallback((enabled: boolean) => {
    setVerboseLoggingState(enabled);
    localStorage.setItem('devpanel_verbose_logging', String(enabled));
  }, []);

  const refreshCredits = useCallback(async () => {
    setCreditsLoading(true);
    setCreditsError(null);
    try {
      const res = await fetch('/api/credits');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCredits({ remaining: data.remaining, total: data.total });
    } catch (err) {
      setCreditsError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setCreditsLoading(false);
    }
  }, []);

  const value: DevPanelContextValue = {
    consoleLogs,
    toolCalls,
    metrics,
    debugMode,
    verboseLogging,
    voiceAgentStatus,
    extensionConnected,
    credits,
    creditsLoading,
    creditsError,
    addConsoleEntry,
    clearConsole,
    addToolCall,
    updateToolCall,
    startTimer,
    endTimer,
    setDebugMode,
    setVerboseLogging,
    setVoiceAgentStatus,
    setExtensionConnected,
    refreshCredits,
  };

  return (
    <DevPanelContext.Provider value={value}>
      {children}
    </DevPanelContext.Provider>
  );
}
```

### 2. Console Capture (lib/console-capture.ts)

```ts
// Console interceptor for DevPanel
type LogLevel = 'log' | 'warn' | 'error' | 'info';

type ConsoleCallback = (level: LogLevel, args: unknown[], source?: string) => void;

let isPatched = false;
let callback: ConsoleCallback | null = null;
const originals: Record<LogLevel, typeof console.log> = {} as any;

export function patchConsole(cb: ConsoleCallback) {
  if (isPatched) return;
  callback = cb;
  
  (['log', 'warn', 'error', 'info'] as LogLevel[]).forEach(level => {
    originals[level] = console[level];
    console[level] = (...args: unknown[]) => {
      originals[level].apply(console, args);
      
      // Detect source from stack trace
      let source: string | undefined;
      try {
        const stack = new Error().stack;
        const match = stack?.split('\n')[2]?.match(/at\s+(.+)\s+\(/);
        source = match?.[1];
      } catch {}
      
      callback?.(level, args, source);
    };
  });
  
  isPatched = true;
}

export function unpatchConsole() {
  if (!isPatched) return;
  (['log', 'warn', 'error', 'info'] as LogLevel[]).forEach(level => {
    console[level] = originals[level];
  });
  isPatched = false;
  callback = null;
}
```

### 3. DevPanel.tsx (Main Container)

```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDevPanelContext, DevPanelProvider } from '@/contexts/DevPanelContext';
import { CreditsDisplay } from './CreditsDisplay';
import { ConnectionStatusPanel } from './ConnectionStatus';
import { LiveConsole } from './LiveConsole';
import { StateInspector } from './StateInspector';
import { QuickActions } from './QuickActions';
import { PerformanceMetrics } from './PerformanceMetrics';
import { FeatureFlags } from './FeatureFlags';
import { patchConsole } from '@/lib/console-capture';

interface DevPanelProps {
  // Passed from parent to inspect
  piiData?: Record<string, unknown>;
  formSchema?: Record<string, unknown> | null;
  lastFillResults?: unknown[];
}

function DevPanelInner({ piiData, formSchema, lastFillResults }: DevPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'console' | 'state' | 'perf'>('console');
  const { addConsoleEntry, refreshCredits } = useDevPanelContext();

  // Check if we should show (dev mode OR ?debug=1)
  const [shouldShow, setShouldShow] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDev = process.env.NODE_ENV === 'development';
      const hasDebugParam = new URLSearchParams(window.location.search).get('debug') === '1';
      setShouldShow(isDev || hasDebugParam);
      
      // Load open state from localStorage
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
    { id: 'console', label: '📝 Console', shortcut: '1' },
    { id: 'state', label: '🔍 State', shortcut: '2' },
    { id: 'perf', label: '⚡ Perf', shortcut: '3' },
  ] as const;

  return (
    <>
      {/* Toggle Button (always visible when panel is closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-gray-800 transition-colors text-sm font-mono"
          title="Open DevPanel (Ctrl+Shift+D)"
        >
          🛠️ Dev
        </button>
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full bg-gray-900 text-gray-100 shadow-2xl z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: '420px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
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

        {/* Credits + Connection Status Bar */}
        <div className="px-4 py-2 bg-gray-850 border-b border-gray-700 space-y-2">
          <CreditsDisplay />
          <ConnectionStatusPanel />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
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
        <div className="flex-1 overflow-hidden" style={{ height: 'calc(100% - 180px)' }}>
          {activeTab === 'console' && <LiveConsole />}
          {activeTab === 'state' && (
            <StateInspector
              piiData={piiData}
              formSchema={formSchema}
              lastFillResults={lastFillResults}
            />
          )}
          {activeTab === 'perf' && <PerformanceMetrics />}
        </div>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700">
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
```

### 4. CreditsDisplay.tsx

```tsx
'use client';

import { useDevPanelContext } from '@/contexts/DevPanelContext';

export function CreditsDisplay() {
  const { credits, creditsLoading, creditsError, refreshCredits } = useDevPanelContext();

  const percentage = credits ? (credits.remaining / credits.total) * 100 : 0;
  const barColor = percentage > 50 ? 'bg-green-500' : percentage > 20 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400 whitespace-nowrap">ElevenLabs:</span>
      
      {creditsLoading && !credits && (
        <span className="text-xs text-gray-500">Loading...</span>
      )}
      
      {creditsError && (
        <span className="text-xs text-red-400">{creditsError}</span>
      )}
      
      {credits && (
        <div className="flex-1 flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full ${barColor} transition-all`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-xs font-mono text-gray-300">
            {credits.remaining.toLocaleString()} / {credits.total.toLocaleString()}
          </span>
        </div>
      )}
      
      <button
        onClick={refreshCredits}
        disabled={creditsLoading}
        className="text-gray-400 hover:text-white disabled:opacity-50"
        title="Refresh"
      >
        🔄
      </button>
    </div>
  );
}
```

### 5. ConnectionStatus.tsx (DevPanel version)

```tsx
'use client';

import { useDevPanelContext } from '@/contexts/DevPanelContext';

export function ConnectionStatusPanel() {
  const { voiceAgentStatus, extensionConnected } = useDevPanelContext();

  const statuses = [
    {
      label: 'Voice Agent',
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
```

### 6. LiveConsole.tsx

```tsx
'use client';

import { useRef, useEffect, useState } from 'react';
import { useDevPanelContext } from '@/contexts/DevPanelContext';

export function LiveConsole() {
  const { consoleLogs, toolCalls, clearConsole } = useDevPanelContext();
  const [filter, setFilter] = useState<'all' | 'log' | 'warn' | 'error' | 'tools'>('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [consoleLogs, toolCalls, autoScroll]);

  const filteredLogs = filter === 'all' ? consoleLogs :
                       filter === 'tools' ? [] :
                       consoleLogs.filter(l => l.level === filter);

  const levelColors = {
    log: 'text-gray-300',
    info: 'text-blue-400',
    warn: 'text-yellow-400',
    error: 'text-red-400',
  };

  const formatArg = (arg: unknown): string => {
    if (arg === null) return 'null';
    if (arg === undefined) return 'undefined';
    if (typeof arg === 'string') return arg;
    if (typeof arg === 'object') {
      try {
        return JSON.stringify(arg, null, 2);
      } catch {
        return String(arg);
      }
    }
    return String(arg);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-850 border-b border-gray-700">
        <select
          value={filter}
          onChange={e => setFilter(e.target.value as typeof filter)}
          className="text-xs bg-gray-700 border-none rounded px-2 py-1 text-gray-200"
        >
          <option value="all">All</option>
          <option value="log">Log</option>
          <option value="warn">Warn</option>
          <option value="error">Error</option>
          <option value="tools">Tool Calls</option>
        </select>
        
        <label className="flex items-center gap-1 text-xs text-gray-400">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={e => setAutoScroll(e.target.checked)}
            className="rounded"
          />
          Auto-scroll
        </label>
        
        <button
          onClick={clearConsole}
          className="ml-auto text-xs text-gray-400 hover:text-white"
        >
          🗑️ Clear
        </button>
      </div>

      {/* Logs */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto font-mono text-xs p-2 space-y-1"
      >
        {filter === 'tools' ? (
          toolCalls.length === 0 ? (
            <div className="text-gray-500 text-center py-4">No tool calls yet</div>
          ) : (
            toolCalls.map(tc => (
              <div key={tc.id} className="p-2 bg-gray-800 rounded border-l-2 border-purple-500">
                <div className="flex items-center gap-2">
                  <span className={tc.status === 'success' ? 'text-green-400' : tc.status === 'error' ? 'text-red-400' : 'text-yellow-400'}>
                    {tc.status === 'pending' ? '⏳' : tc.status === 'success' ? '✅' : '❌'}
                  </span>
                  <span className="text-purple-400 font-semibold">{tc.name}</span>
                  {tc.duration && (
                    <span className="text-gray-500">{tc.duration.toFixed(0)}ms</span>
                  )}
                </div>
                <pre className="mt-1 text-gray-400 overflow-x-auto">
                  {JSON.stringify(tc.params, null, 2)}
                </pre>
                {tc.result && (
                  <pre className="mt-1 text-green-300 overflow-x-auto">
                    → {JSON.stringify(tc.result, null, 2)}
                  </pre>
                )}
              </div>
            ))
          )
        ) : filteredLogs.length === 0 ? (
          <div className="text-gray-500 text-center py-4">No logs yet</div>
        ) : (
          filteredLogs.map(entry => (
            <div key={entry.id} className={`${levelColors[entry.level]} flex gap-2`}>
              <span className="text-gray-500 shrink-0">
                {entry.timestamp.toLocaleTimeString()}
              </span>
              <span className="shrink-0">
                {entry.level === 'error' ? '❌' : entry.level === 'warn' ? '⚠️' : '→'}
              </span>
              <span className="break-all">
                {entry.args.map((a, i) => formatArg(a)).join(' ')}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

### 7. StateInspector.tsx

```tsx
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
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium hover:bg-gray-750"
          >
            <span>{section.label}</span>
            <span className="text-gray-500">{expanded[section.key] ? '▼' : '▶'}</span>
          </button>
          
          {expanded[section.key] && (
            <div className="px-3 pb-3">
              {section.data ? (
                <pre className="text-xs text-gray-300 overflow-x-auto bg-gray-900 rounded p-2">
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
```

### 8. QuickActions.tsx

```tsx
'use client';

import { useDevPanelContext } from '@/contexts/DevPanelContext';

export function QuickActions() {
  const { clearConsole } = useDevPanelContext();

  const actions = [
    {
      label: '🗑️ Clear State',
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
      label: '📝 Clear Console',
      onClick: clearConsole,
    },
    {
      label: '🧪 Test Capture',
      onClick: () => {
        // Dispatch a test capture event
        window.dispatchEvent(new CustomEvent('devpanel:test-capture'));
      },
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
```

### 9. PerformanceMetrics.tsx

```tsx
'use client';

import { useDevPanelContext } from '@/contexts/DevPanelContext';

export function PerformanceMetrics() {
  const { metrics } = useDevPanelContext();

  // Calculate stats per operation type
  const stats = metrics.reduce((acc, m) => {
    if (!acc[m.name]) {
      acc[m.name] = { count: 0, total: 0, min: Infinity, max: 0 };
    }
    acc[m.name].count++;
    acc[m.name].total += m.duration;
    acc[m.name].min = Math.min(acc[m.name].min, m.duration);
    acc[m.name].max = Math.max(acc[m.name].max, m.duration);
    return acc;
  }, {} as Record<string, { count: number; total: number; min: number; max: number }>);

  return (
    <div className="h-full overflow-auto p-3 space-y-4">
      {/* Summary Stats */}
      <div className="bg-gray-800 rounded-lg p-3">
        <h3 className="text-sm font-semibold mb-2">📊 Summary</h3>
        {Object.keys(stats).length === 0 ? (
          <div className="text-xs text-gray-500">No metrics recorded yet</div>
        ) : (
          <div className="space-y-2">
            {Object.entries(stats).map(([name, s]) => (
              <div key={name} className="text-xs">
                <div className="flex justify-between text-gray-300">
                  <span>{name}</span>
                  <span className="font-mono">{(s.total / s.count).toFixed(0)}ms avg</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>{s.count} calls</span>
                  <span>min: {s.min.toFixed(0)}ms / max: {s.max.toFixed(0)}ms</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Timings */}
      <div className="bg-gray-800 rounded-lg p-3">
        <h3 className="text-sm font-semibold mb-2">🕐 Recent Timings</h3>
        <div className="space-y-1 max-h-48 overflow-auto">
          {metrics.slice(-20).reverse().map(m => (
            <div key={m.id} className="flex justify-between text-xs">
              <span className="text-gray-400">{m.name}</span>
              <span className={`font-mono ${m.duration > 1000 ? 'text-red-400' : m.duration > 500 ? 'text-yellow-400' : 'text-green-400'}`}>
                {m.duration.toFixed(0)}ms
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 10. FeatureFlags.tsx

```tsx
'use client';

import { useDevPanelContext } from '@/contexts/DevPanelContext';

export function FeatureFlags() {
  const { debugMode, verboseLogging, setDebugMode, setVerboseLogging } = useDevPanelContext();

  const flags = [
    { label: '🐛 Debug Mode', value: debugMode, onChange: setDebugMode },
    { label: '📢 Verbose Logging', value: verboseLogging, onChange: setVerboseLogging },
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
```

### 11. API Route: /api/credits/route.ts

```ts
import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const res = await fetch('https://api.elevenlabs.io/v1/user/subscription', {
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!res.ok) {
      throw new Error(`ElevenLabs API error: ${res.status}`);
    }

    const data = await res.json();
    
    return NextResponse.json({
      remaining: data.character_count,
      total: data.character_limit,
      tier: data.tier,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

---

## Integration in page.tsx

```tsx
// At the top of page.tsx, add import:
import { DevPanel } from '@/components/dev/DevPanel';

// At the end of the return statement (inside the main element):
<DevPanel
  piiData={piiData as unknown as Record<string, unknown>}
  formSchema={formSchema as unknown as Record<string, unknown> | null}
  lastFillResults={lastFillResults}
/>
```

---

## Environment Variables

Add to `.env.local`:
```
ELEVENLABS_API_KEY=sk_xxx...  # Server-side only (for /api/credits)
```

---

## Summary

| Feature | Component | Status |
|---------|-----------|--------|
| Credits Display | `CreditsDisplay.tsx` + `/api/credits` | Polls every 30s |
| Connection Status | `ConnectionStatusPanel.tsx` | Voice + Extension |
| Live Console | `LiveConsole.tsx` + `console-capture.ts` | Log/Warn/Error/Tool filter |
| State Inspector | `StateInspector.tsx` | PII, Schema, Results |
| Quick Actions | `QuickActions.tsx` | Clear, Reload, Test |
| Performance | `PerformanceMetrics.tsx` | Timer API |
| Feature Flags | `FeatureFlags.tsx` | Debug mode, Verbose |
| Panel Toggle | `DevPanel.tsx` | Ctrl+Shift+D, localStorage persist |
| Visibility | Auto | Dev mode OR `?debug=1` |

---

## Questions for Reviewer

1. Should we add WebSocket connection tracking (currently no WS in the app)?
2. Should the panel width be resizable?
3. Should tool call tracking be automatic via hook instrumentation or manual?
4. Do we need export/download functionality for logs?
