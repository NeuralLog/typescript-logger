import { LogLevel } from '@neurallog/shared';
import { NeuralLog } from '../../NeuralLog';

/**
 * Options for the Pino transport
 */
export interface AILoggerPinoOptions {
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
 * Pino transport for AILogger
 *
 * This transport allows you to send Pino logs to AILogger.
 *
 * Example:
 * ```typescript
 * import pino from 'pino';
 * import { pinoAILogger } from '@neurallog/sdk/transports';
 *
 * // Create Pino logger with AILogger transport
 * const logger = pino({
 *   level: 'info',
 *   transport: {
 *     targets: [
 *       { target: 'pino/file', options: { destination: 'app.log' } },
 *       {
 *         target: pinoAILogger,
 *         options: {
 *           logName: 'my-app'
 *         }
 *       }
 *     ]
 *   }
 * });
 *
 * // Use the logger as normal
 * logger.info('Hello, world!');
 * logger.error('Something went wrong', { error: 'Error details' });
 * ```
 */
export const pinoAILogger = {
  /**
   * Build the Pino transport
   *
   * @param options Transport options
   * @returns Pino transport
   */
  build: (options: AILoggerPinoOptions) => {
    const aiLogger = NeuralLog.Log(options.logName, {
      includeTimestamps: options.includeTimestamps !== false
    });

    return {
      /**
       * Write method called by Pino
       *
       * @param logObject Pino log object
       */
      write: (logObject: string) => {
        try {
          const parsedLog = JSON.parse(logObject);
          const { level, time, pid, hostname, ...rest } = parsedLog;

          // Extract message and data
          const { msg, ...data } = rest;

          // Map Pino log levels to AILogger log levels
          const logLevel = mapPinoLevel(level);

          // Send log to AILogger
          aiLogger.log(logLevel, msg || '', {
            ...data,
            pino: {
              time,
              pid,
              hostname
            }
          }).catch(err => {
            console.error('Error sending log to AILogger:', err instanceof Error ? err.message : String(err));
          });
        } catch (err) {
          console.error('Error parsing Pino log:', err instanceof Error ? err.message : String(err));
        }
      }
    };
  }
};

/**
 * Map Pino log levels to AILogger log levels
 *
 * @param pinoLevel Pino log level
 * @returns AILogger log level
 */
function mapPinoLevel(pinoLevel: number | string): LogLevel {
  // Convert string level to number if needed
  const level = typeof pinoLevel === 'string' ? pinoLevelToNumber(pinoLevel) : pinoLevel;

  // Pino levels: trace=10, debug=20, info=30, warn=40, error=50, fatal=60
  if (level >= 60) return LogLevel.FATAL;
  if (level >= 50) return LogLevel.ERROR;
  if (level >= 40) return LogLevel.WARN;
  if (level >= 30) return LogLevel.INFO;
  return LogLevel.DEBUG;
}

/**
 * Convert Pino level string to number
 *
 * @param levelName Pino level name
 * @returns Pino level number
 */
function pinoLevelToNumber(levelName: string): number {
  switch (levelName.toLowerCase()) {
    case 'fatal': return 60;
    case 'error': return 50;
    case 'warn': return 40;
    case 'info': return 30;
    case 'debug': return 20;
    case 'trace': return 10;
    default: return 30;
  }
}
