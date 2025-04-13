import { LogLevel } from '@neurallog/shared';

/**
 * Interface for logger adapters
 *
 * This interface defines the methods that all logger adapters must implement.
 */
export interface LoggerAdapter {
  /**
   * Log a message at the debug level
   *
   * @param message Message to log
   * @param data Additional data to log
   */
  debug(message: string, data?: Record<string, any>): void;

  /**
   * Log a message at the info level
   *
   * @param message Message to log
   * @param data Additional data to log
   */
  info(message: string, data?: Record<string, any>): void;

  /**
   * Log a message at the warn level
   *
   * @param message Message to log
   * @param data Additional data to log
   */
  warn(message: string, data?: Record<string, any>): void;

  /**
   * Log a message at the error level
   *
   * @param message Message to log
   * @param data Additional data to log
   */
  error(message: string, data?: Record<string, any>): void;

  /**
   * Log a message at the fatal level
   *
   * @param message Message to log
   * @param data Additional data to log
   */
  fatal(message: string, data?: Record<string, any>): void;
}

/**
 * Base adapter options
 */
export interface AdapterOptions {
  /**
   * Whether to forward logs to the original logger
   *
   * @default true
   */
  forwardToOriginal?: boolean;

  /**
   * Whether to include timestamps in logs
   *
   * @default true
   */
  includeTimestamps?: boolean;

  /**
   * Minimum log level to send to AI-MCP-Logger
   *
   * @default LogLevel.DEBUG
   */
  minLevel?: LogLevel;
}
