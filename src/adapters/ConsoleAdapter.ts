import { LogLevel } from '@neurallog/shared';
import { NeuralLog } from '../NeuralLog';
import { AdapterOptions, LoggerAdapter } from './LoggerAdapter';

/**
 * Console adapter options
 */
export interface ConsoleAdapterOptions extends AdapterOptions {
  /**
   * Log name for AI-MCP-Logger
   */
  logName: string;

  /**
   * Custom console object to use
   *
   * @default global.console
   */
  console?: Console;
}

/**
 * Console adapter for AI-MCP-Logger
 *
 * This adapter allows you to use AI-MCP-Logger with the native console.
 *
 * Example:
 * ```typescript
 * import { ConsoleAdapter } from '@ai-mcp-logger/typescript/adapters';
 *
 * // Create adapter
 * const logger = new ConsoleAdapter({
 *   logName: 'my-app'
 * });
 *
 * // Use the logger
 * logger.info('Hello, world!');
 * logger.error('Something went wrong', { error: 'Error details' });
 * ```
 */
export class ConsoleAdapter implements LoggerAdapter {
  private consoleObj: Console;
  private aiLogger: ReturnType<typeof NeuralLog.Log>;
  private forwardToOriginal: boolean;
  private minLevel: LogLevel;

  /**
   * Create a new Console adapter
   *
   * @param options Adapter options
   */
  constructor(options: ConsoleAdapterOptions) {
    this.consoleObj = options.console || console;
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
      this.consoleObj.debug(message, data);
    }

    if (this.shouldLog(LogLevel.DEBUG)) {
      this.aiLogger.debug(message, data).catch(err => {
        this.consoleObj.error('Error sending log to AI-MCP-Logger:', err instanceof Error ? err.message : String(err));
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
      this.consoleObj.info(message, data);
    }

    if (this.shouldLog(LogLevel.INFO)) {
      this.aiLogger.info(message, data).catch(err => {
        this.consoleObj.error('Error sending log to AI-MCP-Logger:', err instanceof Error ? err.message : String(err));
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
      this.consoleObj.warn(message, data);
    }

    if (this.shouldLog(LogLevel.WARN)) {
      this.aiLogger.warn(message, data).catch(err => {
        this.consoleObj.error('Error sending log to AI-MCP-Logger:', err instanceof Error ? err.message : String(err));
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
      this.consoleObj.error(message, data);
    }

    if (this.shouldLog(LogLevel.ERROR)) {
      this.aiLogger.error(message, data).catch(err => {
        this.consoleObj.error('Error sending log to AI-MCP-Logger:', err instanceof Error ? err.message : String(err));
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
      // Console doesn't have a fatal level, so use error
      this.consoleObj.error('[FATAL]', message, data);
    }

    if (this.shouldLog(LogLevel.FATAL)) {
      this.aiLogger.fatal(message, data).catch(err => {
        this.consoleObj.error('Error sending log to AI-MCP-Logger:', err instanceof Error ? err.message : String(err));
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
