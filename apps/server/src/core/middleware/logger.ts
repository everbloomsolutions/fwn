import { Request, Response, NextFunction } from 'express';

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// Read log level directly from process.env to avoid circular dependency with config
const logLevel = (process.env.LOG_LEVEL || 'info').toLowerCase();
const currentLogLevel = logLevels[logLevel as keyof typeof logLevels] ?? 2;

export const logger = {
  error: (message: string, ...args: unknown[]): void => {
    if (currentLogLevel >= logLevels.error) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  },
  warn: (message: string, ...args: unknown[]): void => {
    if (currentLogLevel >= logLevels.warn) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  info: (message: string, ...args: unknown[]): void => {
    if (currentLogLevel >= logLevels.info) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },
  debug: (message: string, ...args: unknown[]): void => {
    if (currentLogLevel >= logLevels.debug) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
};

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });

  next();
};

