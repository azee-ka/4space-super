// shared/src/utils/logger.ts

/**
 * Structured logger utility for consistent logging across platforms
 * Supports different log levels and structured data
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  [key: string]: any;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    // Safe check for environment
    this.isDevelopment = typeof process !== 'undefined' 
      ? process.env.NODE_ENV === 'development'
      : true;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    console.info(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      } : String(error),
    };
    console.error(this.formatMessage('error', message, errorContext));
  }

  // Specialized logging methods for common scenarios
  
  authEvent(event: string, context?: LogContext): void {
    this.info(`Auth: ${event}`, { ...context, category: 'auth' });
  }

  apiCall(method: string, endpoint: string, context?: LogContext): void {
    this.debug(`API: ${method} ${endpoint}`, { ...context, category: 'api' });
  }

  apiError(method: string, endpoint: string, error: Error | unknown, context?: LogContext): void {
    this.error(`API Error: ${method} ${endpoint}`, error, { ...context, category: 'api' });
  }

  cacheEvent(action: string, key: string, context?: LogContext): void {
    this.debug(`Cache: ${action} - ${key}`, { ...context, category: 'cache' });
  }
}

// Export singleton instance
export const logger = new Logger();