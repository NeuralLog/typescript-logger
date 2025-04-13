import { LogLevel } from '@neurallog/shared';
import { NeuralLog } from '../../NeuralLog';

/**
 * Options for the console override
 */
export interface ConsoleOverrideOptions {
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
   * Whether to preserve the original console behavior
   *
   * @default true
   */
  preserveOriginal?: boolean;
}

/**
 * Original console methods
 */
const originalConsole = {
  log: console.log,
  debug: console.debug,
  info: console.info,
  warn: console.warn,
  error: console.error
};

/**
 * Override the global console to send logs to AILogger
 *
 * This function overrides the global console methods to send logs to AILogger.
 *
 * Example:
 * ```typescript
 * import { overrideConsole } from '@neurallog/sdk/transports';
 *
 * // Override console
 * overrideConsole({
 *   logName: 'my-app'
 * });
 *
 * // Use console as normal
 * console.log('Hello, world!');
 * console.error('Something went wrong', { error: 'Error details' });
 * ```
 *
 * @param options Override options
 * @returns Function to restore the original console
 */
export function overrideConsole(options: ConsoleOverrideOptions): () => void {
  const aiLogger = NeuralLog.Log(options.logName, {
    includeTimestamps: options.includeTimestamps !== false
  });

  const preserveOriginal = options.preserveOriginal !== false;

  // Override console.log
  console.log = function(...args: any[]) {
    if (preserveOriginal) {
      originalConsole.log.apply(console, args);
    }

    const message = args[0]?.toString() || '';
    const data = args.length > 1 ? { args: args.slice(1) } : {};

    aiLogger.info(message, data).catch(err => {
      originalConsole.error('Error sending log to AILogger:', err instanceof Error ? err.message : String(err));
    });
  };

  // Override console.debug
  console.debug = function(...args: any[]) {
    if (preserveOriginal) {
      originalConsole.debug.apply(console, args);
    }

    const message = args[0]?.toString() || '';
    const data = args.length > 1 ? { args: args.slice(1) } : {};

    aiLogger.debug(message, data).catch(err => {
      originalConsole.error('Error sending log to AILogger:', err instanceof Error ? err.message : String(err));
    });
  };

  // Override console.info
  console.info = function(...args: any[]) {
    if (preserveOriginal) {
      originalConsole.info.apply(console, args);
    }

    const message = args[0]?.toString() || '';
    const data = args.length > 1 ? { args: args.slice(1) } : {};

    aiLogger.info(message, data).catch(err => {
      originalConsole.error('Error sending log to AILogger:', err instanceof Error ? err.message : String(err));
    });
  };

  // Override console.warn
  console.warn = function(...args: any[]) {
    if (preserveOriginal) {
      originalConsole.warn.apply(console, args);
    }

    const message = args[0]?.toString() || '';
    const data = args.length > 1 ? { args: args.slice(1) } : {};

    aiLogger.warn(message, data).catch(err => {
      originalConsole.error('Error sending log to AILogger:', err instanceof Error ? err.message : String(err));
    });
  };

  // Override console.error
  console.error = function(...args: any[]) {
    if (preserveOriginal) {
      originalConsole.error.apply(console, args);
    }

    const message = args[0]?.toString() || '';
    const data = args.length > 1 ? { args: args.slice(1) } : {};

    aiLogger.error(message, data).catch(err => {
      originalConsole.error('Error sending log to AILogger:', err instanceof Error ? err.message : String(err));
    });
  };

  // Return a function to restore the original console
  return function restoreConsole() {
    console.log = originalConsole.log;
    console.debug = originalConsole.debug;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  };
}
