import Transport from 'winston-transport';
import { LogLevel } from '@neurallog/shared';
import { NeuralLog } from '../../NeuralLog';

/**
 * Options for the Winston transport
 */
export interface AILoggerTransportOptions extends Transport.TransportStreamOptions {
  /**
   * Log name for AILogger
   */
  logName: string;

  /**
   * Whether to include timestamps in logs
   *
   * @default true
   */
  includeTimestamps?: boolean;
}

/**
 * Winston transport for AILogger
 *
 * This transport allows you to send Winston logs to AILogger.
 *
 * Example:
 * ```typescript
 * import winston from 'winston';
 * import { AILoggerTransport } from '@neurallog/sdk/transports';
 *
 * // Create Winston logger with AILogger transport
 * const logger = winston.createLogger({
 *   level: 'info',
 *   format: winston.format.json(),
 *   transports: [
 *     new winston.transports.Console(),
 *     new AILoggerTransport({
 *       logName: 'my-app',
 *       level: 'info'
 *     })
 *   ]
 * });
 *
 * // Use the logger as normal
 * logger.info('Hello, world!');
 * logger.error('Something went wrong', { error: 'Error details' });
 * ```
 */
export class AILoggerTransport extends Transport {
  private aiLogger: ReturnType<typeof NeuralLog.Log>;

  /**
   * Create a new AILogger transport for Winston
   *
   * @param options Transport options
   */
  constructor(options: AILoggerTransportOptions) {
    super(options);

    this.aiLogger = NeuralLog.Log(options.logName, {
      includeTimestamps: options.includeTimestamps !== false
    });
  }

  /**
   * Log method called by Winston
   *
   * @param info Log info
   * @param callback Callback function
   */
  log(info: any, callback: () => void): void {
    setImmediate(() => {
      this.emit('logged', info);
    });

    // Extract level, message, and data
    const { level, message, ...data } = info;

    // Map Winston log levels to AILogger log levels
    const logLevel = this.mapLogLevel(level);

    // Send log to AILogger
    this.aiLogger.log(logLevel, message, data)
      .then(() => {
        callback();
      })
      .catch(err => {
        this.emit('error', err);
        callback();
      });
  }

  /**
   * Map Winston log levels to AILogger log levels
   *
   * @param winstonLevel Winston log level
   * @returns AILogger log level
   */
  private mapLogLevel(winstonLevel: string): LogLevel {
    // Winston default levels: error, warn, info, http, verbose, debug, silly
    switch (winstonLevel.toLowerCase()) {
      case 'error':
        return LogLevel.ERROR;
      case 'warn':
        return LogLevel.WARN;
      case 'info':
        return LogLevel.INFO;
      case 'http':
      case 'verbose':
      case 'debug':
        return LogLevel.DEBUG;
      case 'silly':
        return LogLevel.DEBUG;
      case 'fatal':
        return LogLevel.FATAL;
      default:
        return LogLevel.INFO;
    }
  }
}
