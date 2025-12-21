/**
 * Centralized Logging Utility
 * Replaces console.log/error/warn with structured logging
 * Supports both client and server environments
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: Error;
}

class Logger {
  private isClient: boolean;

  constructor() {
    this.isClient = typeof window !== 'undefined';
  }

  private get isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
  }

  private formatMessage(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(context && { context }),
      ...(error && { error: { name: error.name, message: error.message, stack: error.stack } }),
    };
  }

  private shouldLog(level: LogLevel): boolean {
    // In test environment, always log for testing purposes
    if (process.env.NODE_ENV === 'test') {
      return true;
    }
    // In production, only log warnings and errors
    if (!this.isDevelopment) {
      return level === 'warn' || level === 'error';
    }
    return true;
  }

  private output(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    const { level, message, timestamp, context, error } = entry;
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    // In test environment, always use server-side logging with correct console methods
    // (Jest/jsdom defines window, but we want to use console.error/warn for proper testing)
    const isTestEnv = process.env.NODE_ENV === 'test';
    
    // Format for console
    if (this.isClient && !isTestEnv) {
      // Client-side logging with colors (only in non-test environments)
      const styles: Record<LogLevel, string> = {
        debug: 'color: #6b7280; font-weight: normal;',
        info: 'color: #3b82f6; font-weight: normal;',
        warn: 'color: #f59e0b; font-weight: bold;',
        error: 'color: #ef4444; font-weight: bold;',
      };

      console.log(`%c${prefix} ${message}`, styles[level], context || '', error || '');
    } else {
      // Server-side logging (including test environment)
      // Use the appropriate console method for each level
      if (entry.level === 'error') {
        console.error(prefix, message, context || '', error || '');
      } else if (entry.level === 'warn') {
        console.warn(prefix, message, context || '', error || '');
      } else {
        console.log(prefix, message, context || '', error || '');
      }
    }

    // TODO: In production, send errors to monitoring service (Sentry, LogRocket, etc.)
    if (!this.isDevelopment && entry.level === 'error' && error) {
      // Example: Send to error tracking service
      // Sentry.captureException(error, { extra: context });
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.output(this.formatMessage('debug', message, context));
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.output(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: Record<string, unknown>, error?: Error): void {
    this.output(this.formatMessage('warn', message, context, error));
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.output(this.formatMessage('error', message, context, error));
  }

  // Convenience method for API route errors
  apiError(endpoint: string, error: Error | unknown, context?: Record<string, unknown>): void {
    const err = error instanceof Error ? error : new Error(String(error));
    this.error(`API Error [${endpoint}]: ${err.message}`, err, {
      endpoint,
      ...context,
    });
  }

  // Convenience method for Firebase errors
  firebaseError(operation: string, error: Error | unknown, context?: Record<string, unknown>): void {
    const err = error instanceof Error ? error : new Error(String(error));
    this.error(`Firebase Error [${operation}]: ${err.message}`, err, {
      operation,
      ...context,
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export types for use in other files
export type { LogLevel, LogEntry };

