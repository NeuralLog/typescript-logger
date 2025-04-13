import { Logger as LoglevelLogger } from 'loglevel';
import { LogLevel } from '@neurallog/shared';
import { NeuralLog } from '../../NeuralLog';

/**
 * Options for the Loglevel plugin
 */
export interface LoglevelPluginOptions {
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
 * Original method type for Loglevel
 */
type OriginalMethodType = (message: any, ...args: any[]) => void;

/**
 * Add AILogger plugin to Loglevel
 *
 * This function adds a plugin to Loglevel to send logs to AILogger.
 *
 * Example:
 * ```typescript
 * import log from 'loglevel';
 * import { addAILoggerToLoglevel } from '@neurallog/sdk/transports';
 *
 * // Add plugin to Loglevel
 * addAILoggerToLoglevel(log, {
 *   logName: 'my-app'
 * });
 *
 * // Use Loglevel as normal
 * log.info('Hello, world!');
 * log.error('Something went wrong', { error: 'Error details' });
 * ```
 *
 * @param logger Loglevel logger instance
 * @param options Plugin options
 * @returns Function to remove the plugin
 */
export function addAILoggerToLoglevel(logger: LoglevelLogger, options: LoglevelPluginOptions): () => void {
  const aiLogger = NeuralLog.Log(options.logName, {
    includeTimestamps: options.includeTimestamps !== false
  });

  // Store original methods
  const originalMethods: Record<string, OriginalMethodType> = {
    trace: logger.trace,
    debug: logger.debug,
    info: logger.info,
    warn: logger.warn,
    error: logger.error
  };

  // Override trace method
  logger.methodFactory = function(methodName, logLevel, loggerName) {
    const originalMethod = originalMethods[methodName] || function() {};

    return function(message, ...args) {
      // Call original method
      originalMethod.call(logger, message, ...args);

      // Map Loglevel method to AILogger level
      const aiLogLevel = mapLoglevelMethod(methodName);

      // Extract data from args
      const data = args.length > 0 ? { args } : {};

      // Send log to AILogger
      aiLogger.log(aiLogLevel, message?.toString() || '', data).catch(err => {
        console.error('Error sending log to AILogger:', err instanceof Error ? err.message : String(err));
      });
    };
  };

  // Apply the changes
  logger.setLevel(logger.getLevel());

  // Return a function to remove the plugin
  return function removePlugin() {
    // Restore original methodFactory
    logger.methodFactory = function(methodName, logLevel, loggerName) {
      return originalMethods[methodName] || function() {};
    };

    // Apply the changes
    logger.setLevel(logger.getLevel());
  };
}

/**
 * Map Loglevel method names to AILogger log levels
 *
 * @param methodName Loglevel method name
 * @returns AILogger log level
 */
function mapLoglevelMethod(methodName: string): LogLevel {
  switch (methodName.toLowerCase()) {
    case 'trace': return LogLevel.DEBUG;
    case 'debug': return LogLevel.DEBUG;
    case 'info': return LogLevel.INFO;
    case 'warn': return LogLevel.WARN;
    case 'error': return LogLevel.ERROR;
    default: return LogLevel.INFO;
  }
}
