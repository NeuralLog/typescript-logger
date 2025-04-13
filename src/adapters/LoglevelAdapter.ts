import { Logger as LoglevelLogger } from 'loglevel';
import { LogLevel } from '@neurallog/shared';
import { NeuralLog } from '../NeuralLog';
import { AdapterOptions, LoggerAdapter } from './LoggerAdapter';

/**
 * Loglevel adapter options
 */
export interface LoglevelAdapterOptions extends AdapterOptions {
  /**
   * Loglevel logger instance
   */
  logger: LoglevelLogger;

  /**
   * Log name for AILogger
   */
  logName: string;
}

/**
 * Loglevel adapter for AILogger
 *
 * This adapter allows you to use AILogger with Loglevel.
 *
 * Example:
 * ```typescript
 * import log from 'loglevel';
 * import { LoglevelAdapter } from '@neurallog/sdk/adapters';
 *
 * // Configure Loglevel
 * log.setLevel('info');
 *
 * // Create adapter
 * const logger = new LoglevelAdapter({
 *   logger: log,
 *   logName: 'my-app'
 * });
 *
 * // Use the logger
 * logger.info('Hello, world!');
 * logger.error('Something went wrong', { error: 'Error details' });
 * ```
 */
export class LoglevelAdapter implements LoggerAdapter {
  private originalLogger: LoglevelLogger;
  private aiLogger: ReturnType<typeof NeuralLog.Log>;
  private forwardToOriginal: boolean;
  private minLevel: LogLevel;

  /**
   * Create a new Loglevel adapter
   *
   * @param options Adapter options
   */
  constructor(options: LoglevelAdapterOptions) {
    this.originalLogger = options.logger;
    this.aiLogger = NeuralLog.Log(options.logName, {
      includeTimestamps: options.includeTimestamps !== false
    });
    this.forwardToOriginal = options.forwardToOriginal !== false;
    this.minLevel = options.minLevel || LogLevel.DEBUG;
  }

  /**
   * Log a message at the debug level
   *
   * @param message Message to log
   * @param data Additional data to log
   */
  debug(message: string, data: Record<string, any> = {}): void {
    if (this.forwardToOriginal) {
      this.originalLogger.debug(message, data);
    }

    if (this.shouldLog(LogLevel.DEBUG)) {
      this.aiLogger.debug(message, data).catch(err => {
        this.originalLogger.error('Error sending log to AILogger:', err instanceof Error ? err.message : String(err));
      });
    }
  }

  /**
   * Log a message at the info level
   *
   * @param message Message to log
   * @param data Additional data to log
   */
  info(message: string, data: Record<string, any> = {}): void {
    if (this.forwardToOriginal) {
      this.originalLogger.info(message, data);
    }

    if (this.shouldLog(LogLevel.INFO)) {
      this.aiLogger.info(message, data).catch(err => {
        this.originalLogger.error('Error sending log to AILogger:', err instanceof Error ? err.message : String(err));
      });
    }
  }

  /**
   * Log a message at the warn level
   *
   * @param message Message to log
   * @param data Additional data to log
   */
  warn(message: string, data: Record<string, any> = {}): void {
    if (this.forwardToOriginal) {
      this.originalLogger.warn(message, data);
    }

    if (this.shouldLog(LogLevel.WARN)) {
      this.aiLogger.warn(message, data).catch(err => {
        this.originalLogger.error('Error sending log to AILogger:', err instanceof Error ? err.message : String(err));
      });
    }
  }

  /**
   * Log a message at the error level
   *
   * @param message Message to log
   * @param data Additional data to log
   */
  error(message: string, data: Record<string, any> = {}): void {
    if (this.forwardToOriginal) {
      this.originalLogger.error(message, data);
    }

    if (this.shouldLog(LogLevel.ERROR)) {
      this.aiLogger.error(message, data).catch(err => {
        this.originalLogger.error('Error sending log to AILogger:', err instanceof Error ? err.message : String(err));
      });
    }
  }

  /**
   * Log a message at the fatal level
   *
   * @param message Message to log
   * @param data Additional data to log
   */
  fatal(message: string, data: Record<string, any> = {}): void {
    if (this.forwardToOriginal) {
      // Loglevel doesn't have a fatal level, so use error
      this.originalLogger.error('[FATAL]', message, data);
    }

    if (this.shouldLog(LogLevel.FATAL)) {
      this.aiLogger.fatal(message, data).catch(err => {
        this.originalLogger.error('Error sending log to AILogger:', err instanceof Error ? err.message : String(err));
      });
    }
  }

  /**
   * Check if a log level should be logged
   *
   * @param level Log level to check
   * @returns Whether the log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    const levelOrder = {
      [LogLevel.DEBUG]: 0,
      [LogLevel.INFO]: 1,
      [LogLevel.WARN]: 2,
      [LogLevel.ERROR]: 3,
      [LogLevel.FATAL]: 4
    };

    return levelOrder[level] >= levelOrder[this.minLevel];
  }
}
