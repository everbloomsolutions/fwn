/**
 * Client-side logger utility
 * In production, only errors are logged
 * In development, all logs are shown
 * 
 * Error tracking: Supports Sentry, LogRocket, and other error tracking services
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogContext {
  [key: string]: unknown;
}

// Error tracking service interfaces
interface SentryWindow {
  captureException?: (error: Error | unknown, context?: { extra?: unknown[] }) => void;
  captureMessage?: (message: string, level?: string) => void;
}

interface LogRocketWindow {
  captureException?: (error: Error | unknown) => void;
  log?: (message: string, ...args: unknown[]) => void;
}

declare global {
  interface Window {
    Sentry?: SentryWindow;
    LogRocket?: LogRocketWindow;
  }
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
  
  /**
   * Send error to tracking services
   */
  private sendToErrorTracking(error: Error | unknown, context?: { extra?: unknown[] }): void {
    if (typeof window === 'undefined') return;

    // Sentry integration
    if (window.Sentry?.captureException) {
      try {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        window.Sentry.captureException(errorObj, context);
      } catch (e) {
        // Silently fail if error tracking fails
      }
    }

    // LogRocket integration
    if (window.LogRocket?.captureException) {
      try {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        window.LogRocket.captureException(errorObj);
      } catch (e) {
        // Silently fail if error tracking fails
      }
    }
  }

  /**
   * Log an error (always logged, even in production)
   */
  error(message: string, ...args: unknown[]): void {
    console.error(`[ERROR] ${message}`, ...args);
    
    // Send to error tracking services
    try {
      const error = args[0] instanceof Error ? args[0] : new Error(message);
      this.sendToErrorTracking(error, { extra: args });
    } catch (e) {
      // Fallback if error creation fails
      this.sendToErrorTracking(new Error(message), { extra: args });
    }
  }
  
  /**
   * Log a warning (only in development)
   */
  warn(message: string, ...args: unknown[]): void {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }
  
  /**
   * Log informational message (only in development)
   */
  info(message: string, ...args: unknown[]): void {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }
  
  /**
   * Log debug message (only in development)
   */
  debug(message: string, ...args: unknown[]): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }
  
  /**
   * Log with context (structured logging)
   */
  logWithContext(level: LogLevel, message: string, context?: LogContext): void {
    const logMessage = context 
      ? `${message} ${JSON.stringify(context)}`
      : message;
    
    switch (level) {
      case 'error':
        this.error(logMessage);
        break;
      case 'warn':
        this.warn(logMessage);
        break;
      case 'info':
        this.info(logMessage);
        break;
      case 'debug':
        this.debug(logMessage);
        break;
    }
  }
}

export const logger = new Logger();
export default logger;

