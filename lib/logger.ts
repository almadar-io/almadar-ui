/**
 * Almadar Structured Logger
 *
 * Namespace-based logging with level gating and correlation IDs.
 * Pure TypeScript, zero React dependencies. Works in Node.js, Vite, and browser.
 *
 * @packageDocumentation
 */

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

const LEVEL_PRIORITY: Record<LogLevel, number> = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };

// Environment detection. Uses ONLY `process.env` (no `import.meta`) so that
// the published bundle works in:
//   * Node.js (real process.env)
//   * Vite (process.env is polyfilled when define is configured, otherwise empty)
//   * Webpack / Docusaurus SSG (process.env is polyfilled by DefinePlugin)
//   * Plain browsers without bundlers (typeof process check falls through to {})
//
// We deliberately do NOT touch `import.meta` here because esbuild's optimizer
// inlines indirect eval forms back to the raw `import.meta` token, which then
// breaks Webpack's static parse with "Cannot use 'import.meta' outside a module".
const ENV: Record<string, string | undefined> =
  typeof process !== 'undefined' && process.env ? process.env : {};

function envGet(key: string): string | undefined {
  return ENV[key] ?? ENV[`VITE_${key}`];
}

const NODE_ENV = envGet('NODE_ENV') ?? 'development';
const CONFIGURED_LEVEL = (
  envGet('LOG_LEVEL') ?? (NODE_ENV === 'production' ? 'info' : 'debug')
).toUpperCase() as LogLevel;
const MIN_PRIORITY = LEVEL_PRIORITY[CONFIGURED_LEVEL] ?? 0;

const DEBUG_FILTER = (envGet('ALMADAR_DEBUG') ?? '')
  .split(',').map(s => s.trim()).filter(Boolean);

function matchesNamespace(namespace: string): boolean {
  if (DEBUG_FILTER.length === 0) return true;
  return DEBUG_FILTER.some(pattern => {
    if (pattern === '*' || pattern === 'almadar:*') return true;
    if (pattern.endsWith(':*')) return namespace.startsWith(pattern.slice(0, -1));
    return namespace === pattern;
  });
}

export interface Logger {
  debug: (msg: string, data?: Record<string, unknown>, cid?: string) => void;
  info: (msg: string, data?: Record<string, unknown>, cid?: string) => void;
  warn: (msg: string, data?: Record<string, unknown>, cid?: string) => void;
  error: (msg: string, data?: Record<string, unknown>, cid?: string) => void;
}

export function createLogger(namespace: string): Logger {
  const nsAllowed = matchesNamespace(namespace);

  const log = (level: LogLevel, message: string, data?: Record<string, unknown>, correlationId?: string) => {
    if (LEVEL_PRIORITY[level] < MIN_PRIORITY) return;
    if (level === 'DEBUG' && !nsAllowed) return;

    const prefix = `[${namespace}]`;
    const logData = correlationId ? { ...data, cid: correlationId } : data;

    switch (level) {
      case 'DEBUG': console.debug(prefix, message, logData ?? ''); break;
      case 'INFO':  console.info(prefix, message, logData ?? ''); break;
      case 'WARN':  console.warn(prefix, message, logData ?? ''); break;
      case 'ERROR': console.error(prefix, message, logData ?? ''); break;
    }
  };

  return {
    debug: (msg: string, data?: Record<string, unknown>, cid?: string) => log('DEBUG', msg, data, cid),
    info:  (msg: string, data?: Record<string, unknown>, cid?: string) => log('INFO', msg, data, cid),
    warn:  (msg: string, data?: Record<string, unknown>, cid?: string) => log('WARN', msg, data, cid),
    error: (msg: string, data?: Record<string, unknown>, cid?: string) => log('ERROR', msg, data, cid),
  };
}

let _cidCounter = 0;
export function generateCorrelationId(): string {
  return `evt-${Date.now()}-${++_cidCounter}`;
}
