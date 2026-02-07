// Console interceptor for DevPanel
type LogLevel = 'log' | 'warn' | 'error' | 'info';

type ConsoleCallback = (level: LogLevel, args: unknown[], source?: string) => void;

let isPatched = false;
let callback: ConsoleCallback | null = null;
const originals: Record<LogLevel, typeof console.log> = {} as Record<LogLevel, typeof console.log>;

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
      } catch {
        // ignore
      }
      
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
