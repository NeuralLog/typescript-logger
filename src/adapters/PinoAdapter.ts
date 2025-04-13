import { Logger as PinoLogger } from 'pino';
import { LogLevel } from '@neurallog/shared';
import { NeuralLog } from '../NeuralLog';
import { AdapterOptions, LoggerAdapter } from './LoggerAdapter';

/**
 * Pino adapter options
 */
export interface PinoAdapterOptions extends AdapterOptions {
  /**
   * Pino logger instance
   */
  logger: PinoLogger;

  /**
   * Log name for AI-MCP-Logger
   */
  logName: string;
}

/**
 * Pino adapter for AI-MCP-Logger
 *
 * This adapter allows you to use AI-MCP-Logger with Pino.
 *
 * Example:
 * ```typescript
 * import pino from 'pino';
 * import { PinoAdapter } from '@ai-mcp-logger/typescript/adapters';
 *
 * // Create Pino logger
 * const pinoLogger = pino({
 *   level: 'info'
 * });
 *
 * // Create adapter
 * const logger = new PinoAdapter({
 *   logger: pinoLogger,
 *   logName: 'my-app'
 * });
 *
 * // Use the logger
 * logger.info('Hello, world!');
 * logger.error('Something went wrong', { error: 'Error details' });
 * ```
 */
export class PinoAdapter implements LoggerAdapter {
  private originalLogger: PinoLogger;
  private aiLogger: ReturnType<typeof NeuralLog.Log>;
  private forwardToOriginal: boolean;
  private minLevel: LogLevel;

  /**
   * Create a new Pino adapter
   *
   * @param options Adapter options
   */
  constructor(options: PinoAdapterOptions) {
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
      this.originalLogger.debug(data, message);
    }

    if (this.shouldLog(LogLevel.DEBUG)) {
      this.aiLogger.debug(message, data).catch(err => {
        this.originalLogger.error({ error: err instanceof Error ? err.message : String(err) }, 'Error sending log to AI-MCP-Logger');
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
      this.originalLogger.info(data, message);
    }

    if (this.shouldLog(LogLevel.INFO)) {
      this.aiLogger.info(message, data).catch(err => {
        this.originalLogger.error({ error: err instanceof Error ? err.message : String(err) }, 'Error sending log to AI-MCP-Logger');
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
      this.originalLogger.warn(data, message);
    }

    if (this.shouldLog(LogLevel.WARN)) {
      this.aiLogger.warn(message, data).catch(err => {
        this.originalLogger.error({ error: err instanceof Error ? err.message : String(err) }, 'Error sending log to AI-MCP-Logger');
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
      this.originalLogger.error(data, message);
    }

    if (this.shouldLog(LogLevel.ERROR)) {
      this.aiLogger.error(message, data).catch(err => {
        this.originalLogger.error({ error: err instanceof Error ? err.message : String(err) }, 'Error sending log to AI-MCP-Logger');
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
      this.originalLogger.fatal(data, message);
    }

    if (this.shouldLog(LogLevel.FATAL)) {
      this.aiLogger.fatal(message, data).catch(err => {
        this.originalLogger.error({ error: err instanceof Error ? err.message : String(err) }, 'Error sending log to AI-MCP-Logger');
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
