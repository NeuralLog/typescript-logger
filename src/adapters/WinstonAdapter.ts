import { Logger as WinstonLogger } from 'winston';
import { LogLevel } from '@neurallog/shared';
import { NeuralLog } from '../NeuralLog';
import { AdapterOptions, LoggerAdapter } from './LoggerAdapter';

/**
 * Winston adapter options
 */
export interface WinstonAdapterOptions extends AdapterOptions {
  /**
   * Winston logger instance
   */
  logger: WinstonLogger;

  /**
   * Log name for AI-MCP-Logger
   */
  logName: string;
}

/**
 * Winston adapter for AI-MCP-Logger
 *
 * This adapter allows you to use AI-MCP-Logger with Winston.
 *
 * Example:
 * ```typescript
 * import winston from 'winston';
 * import { WinstonAdapter } from '@ai-mcp-logger/typescript/adapters';
 *
 * // Create Winston logger
 * const winstonLogger = winston.createLogger({
 *   level: 'info',
 *   format: winston.format.json(),
 *   transports: [
 *     new winston.transports.Console()
 *   ]
 * });
 *
 * // Create adapter
 * const logger = new WinstonAdapter({
 *   logger: winstonLogger,
 *   logName: 'my-app'
 * });
 *
 * // Use the logger
 * logger.info('Hello, world!');
 * logger.error('Something went wrong', { error: 'Error details' });
 * ```
 */
export class WinstonAdapter implements LoggerAdapter {
  private originalLogger: WinstonLogger;
  private aiLogger: ReturnType<typeof NeuralLog.Log>;
  private forwardToOriginal: boolean;
  private minLevel: LogLevel;

  /**
   * Create a new Winston adapter
   *
   * @param options Adapter options
   */
  constructor(options: WinstonAdapterOptions) {
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
        this.originalLogger.error(`Error sending log to AI-MCP-Logger: ${err instanceof Error ? err.message : String(err)}`);
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
        this.originalLogger.error(`Error sending log to AI-MCP-Logger: ${err instanceof Error ? err.message : String(err)}`);
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
        this.originalLogger.error(`Error sending log to AI-MCP-Logger: ${err instanceof Error ? err.message : String(err)}`);
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
        this.originalLogger.error(`Error sending log to AI-MCP-Logger: ${err instanceof Error ? err.message : String(err)}`);
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
      // Winston doesn't have a fatal level, so use error
      this.originalLogger.error(message, { ...data, level: 'fatal' });
    }

    if (this.shouldLog(LogLevel.FATAL)) {
      this.aiLogger.fatal(message, data).catch(err => {
        this.originalLogger.error(`Error sending log to AI-MCP-Logger: ${err instanceof Error ? err.message : String(err)}`);
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
