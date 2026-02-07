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
  consoleLogs: ConsoleEntry[];
  toolCalls: ToolCall[];
  metrics: PerformanceEntry[];
  debugMode: boolean;
  verboseLogging: boolean;
  voiceAgentStatus: 'disconnected' | 'connecting' | 'connected';
  extensionConnected: boolean;
  credits: { remaining: number; total: number; } | null;
  creditsLoading: boolean;
  creditsError: string | null;
}

interface DevPanelContextValue extends DevPanelState {
  addConsoleEntry: (entry: Omit<ConsoleEntry, 'id'>) => void;
  clearConsole: () => void;
  addToolCall: (call: Omit<ToolCall, 'id'>) => number;
  updateToolCall: (id: number, updates: Partial<ToolCall>) => void;
  startTimer: (name: string, metadata?: Record<string, unknown>) => number;
  endTimer: (id: number) => void;
  setDebugMode: (enabled: boolean) => void;
  setVerboseLogging: (enabled: boolean) => void;
  setVoiceAgentStatus: (status: DevPanelState['voiceAgentStatus']) => void;
  setExtensionConnected: (connected: boolean) => void;
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDebugModeState(localStorage.getItem('devpanel_debug_mode') === 'true');
      setVerboseLoggingState(localStorage.getItem('devpanel_verbose_logging') === 'true');
    }
  }, []);

  const addConsoleEntry = useCallback((entry: Omit<ConsoleEntry, 'id'>) => {
    setConsoleLogs(prev => {
      const newLogs = [...prev, { ...entry, id: ++entryIdRef.current }];
      return newLogs.slice(-500);
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
