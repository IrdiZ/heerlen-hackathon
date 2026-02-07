'use client';

import { useRef, useEffect, useState } from 'react';
import { useDevPanelContext } from '@/contexts/DevPanelContext';

export function LiveConsole() {
  const { consoleLogs, toolCalls, clearConsole } = useDevPanelContext();
  const [filter, setFilter] = useState<'all' | 'log' | 'warn' | 'error' | 'tools'>('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [consoleLogs, toolCalls, autoScroll]);

  const filteredLogs = filter === 'all' ? consoleLogs :
                       filter === 'tools' ? [] :
                       consoleLogs.filter(l => l.level === filter);

  const levelColors: Record<string, string> = {
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
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 border-b border-gray-700">
        <select
          value={filter}
          onChange={e => setFilter(e.target.value as typeof filter)}
          className="text-xs bg-gray-700 border-none rounded px-2 py-1 text-gray-200"
        >
          <option value="all">All</option>
          <option value="log">Log</option>
          <option value="warn">Warn</option>
          <option value="error">Error</option>
          <option value="tools">Tools</option>
        </select>
        
        <label className="flex items-center gap-1 text-xs text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={e => setAutoScroll(e.target.checked)}
            className="rounded bg-gray-700"
          />
          Auto-scroll
        </label>
        
        <button
          onClick={clearConsole}
          className="ml-auto text-xs text-gray-400 hover:text-white transition-colors"
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
                <pre className="mt-1 text-gray-400 overflow-x-auto text-[10px]">
                  {JSON.stringify(tc.params, null, 2)}
                </pre>
                {tc.result && (
                  <pre className="mt-1 text-green-300 overflow-x-auto text-[10px]">
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
              <span className="text-gray-500 shrink-0 text-[10px]">
                {entry.timestamp.toLocaleTimeString()}
              </span>
              <span className="shrink-0">
                {entry.level === 'error' ? '❌' : entry.level === 'warn' ? '⚠️' : '→'}
              </span>
              <span className="break-all">
                {entry.args.map(a => formatArg(a)).join(' ')}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
