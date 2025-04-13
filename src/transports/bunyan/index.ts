import { LogLevel } from '@neurallog/shared';
import { NeuralLog } from '../../NeuralLog';

/**
 * Bunyan stream interface
 */
interface BunyanStream {
  write: (record: any) => void;
}

/**
 * Options for the Bunyan stream
 */
export interface AILoggerStreamOptions {
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

  /**
   * Bunyan stream type
   *
   * @default 'raw'
   */
  type?: 'raw' | 'stream';
}

/**
 * Bunyan stream for AILogger
 *
 * This stream allows you to send Bunyan logs to AILogger.
 *
 * Example:
 * ```typescript
 * import bunyan from 'bunyan';
 * import { AILoggerStream } from '@neurallog/sdk/transports';
 *
 * // Create Bunyan logger with AILogger stream
 * const logger = bunyan.createLogger({
 *   name: 'my-app',
 *   streams: [
 *     {
 *       level: 'info',
 *       stream: process.stdout
 *     },
 *     {
 *       level: 'info',
 *       type: 'raw',
 *       stream: new AILoggerStream({
 *         logName: 'my-app'
 *       })
 *     }
 *   ]
 * });
 *
 * // Use the logger as normal
 * logger.info('Hello, world!');
 * logger.error({ err: new Error('Something went wrong') }, 'Error occurred');
 * ```
 */
export class AILoggerStream implements BunyanStream {
  private aiLogger: ReturnType<typeof NeuralLog.Log>;

  /**
   * Create a new AILogger stream for Bunyan
   *
   * @param options Stream options
   */
  constructor(options: AILoggerStreamOptions) {
    this.aiLogger = NeuralLog.Log(options.logName, {
      includeTimestamps: options.includeTimestamps !== false
    });
  }

  /**
   * Write method called by Bunyan
   *
   * @param record Bunyan log record
   */
  write(record: any): void {
    // Extract level, message, and data
    const { level, msg, time, v, hostname, pid, name, ...data } = record;

    // Map Bunyan log levels to AILogger log levels
    const logLevel = this.mapLogLevel(level);

    // Send log to AILogger
    this.aiLogger.log(logLevel, msg, {
      ...data,
      bunyan: {
        time,
        hostname,
        pid,
        name
      }
    }).catch(err => {
      console.error('Error sending log to AILogger:', err instanceof Error ? err.message : String(err));
    });
  }

  /**
   * Map Bunyan log levels to AILogger log levels
   *
   * @param bunyanLevel Bunyan log level
   * @returns AILogger log level
   */
  private mapLogLevel(bunyanLevel: number): LogLevel {
    // Bunyan levels: TRACE=10, DEBUG=20, INFO=30, WARN=40, ERROR=50, FATAL=60
    if (bunyanLevel >= 60) return LogLevel.FATAL;
    if (bunyanLevel >= 50) return LogLevel.ERROR;
    if (bunyanLevel >= 40) return LogLevel.WARN;
    if (bunyanLevel >= 30) return LogLevel.INFO;
    return LogLevel.DEBUG;
  }
}
