import { appendFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { getConfig } from './config.js';

/**
 * Log levels for filtering output
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Get the minimum log level from environment
 */
function getMinLogLevel(): LogLevel {
  const envLevel = process.env['LOCAL_RECALL_LOG_LEVEL']?.toLowerCase();
  if (envLevel && envLevel in LOG_LEVELS) {
    return envLevel as LogLevel;
  }
  // Default to 'info' unless debug mode is enabled
  return process.env['LOCAL_RECALL_DEBUG'] === '1' ? 'debug' : 'info';
}

/**
 * Format a log message with timestamp and level
 */
function formatMessage(level: LogLevel, component: string, message: string): string {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.toUpperCase()}] [${component}] ${message}`;
}

/**
 * Get the path to the recall.log file
 */
function getLogPath(): string {
  try {
    const config = getConfig();
    return path.join(config.memoryDir, 'recall.log');
  } catch {
    // Config not loaded yet, use default
    const baseDir = process.env['LOCAL_RECALL_DIR'] ?? './local-recall';
    return path.join(baseDir, 'recall.log');
  }
}

/**
 * Ensure the log directory exists
 */
function ensureLogDir(logPath: string): void {
  const dir = path.dirname(logPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

/**
 * Write a log entry to the recall.log file
 */
function writeLog(level: LogLevel, component: string, message: string): void {
  const minLevel = getMinLogLevel();

  // Skip if below minimum log level
  if (LOG_LEVELS[level] < LOG_LEVELS[minLevel]) {
    return;
  }

  try {
    const logPath = getLogPath();
    ensureLogDir(logPath);

    const formattedMessage = formatMessage(level, component, message);
    appendFileSync(logPath, formattedMessage + '\n', 'utf-8');
  } catch {
    // Silently fail - logging should never break the application
  }
}

/**
 * Create a logger instance for a specific component
 */
export function createLogger(component: string) {
  return {
    debug: (message: string) => writeLog('debug', component, message),
    info: (message: string) => writeLog('info', component, message),
    warn: (message: string) => writeLog('warn', component, message),
    error: (message: string) => writeLog('error', component, message),
  };
}

/**
 * Pre-configured loggers for common components
 */
export const logger = {
  hooks: createLogger('hooks'),
  memory: createLogger('memory'),
  index: createLogger('index'),
  search: createLogger('search'),
  mcp: createLogger('mcp'),
  config: createLogger('config'),
};
