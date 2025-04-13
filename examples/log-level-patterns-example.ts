import { NeuralLog, LogLevel } from '../src';

/**
 * This example demonstrates pattern-based log level filtering.
 *
 * The configuration file (neurallog.config.json) contains the following:
 *
 * {
 *   "serverUrl": "http://localhost:3030",
 *   "logLevels": {
 *     "default": "info",
 *     "patterns": [
 *       {
 *         "pattern": "src/server/**",
 *         "level": "warn"
 *       },
 *       {
 *         "pattern": "component/ui.tsx",
 *         "level": "debug"
 *       },
 *       {
 *         "pattern": "auth/*",
 *         "level": "error"
 *       }
 *     ]
 *   }
 * }
 *
 * This means:
 * - By default, only INFO and above will be logged
 * - For logs with names matching "src/server/**", only WARN and above will be logged
 * - For logs with names matching "component/ui.tsx", DEBUG and above will be logged
 * - For logs with names matching "auth/*", only ERROR and above will be logged
 */

async function main() {
  try {
    // Create loggers for different components
    const defaultLogger = NeuralLog.Log('default-component');
    const serverLogger = NeuralLog.Log('src/server/api');
    const uiLogger = NeuralLog.Log('component/ui.tsx');
    const authLogger = NeuralLog.Log('auth/login');

    console.log('Logging at different levels for different components:');
    console.log('---------------------------------------------------');

    // Default logger (should log INFO and above)
    console.log('\nDefault logger (default-component):');
    await defaultLogger.debug('This DEBUG message should NOT be logged'); // Filtered out
    await defaultLogger.info('This INFO message should be logged');
    await defaultLogger.warn('This WARN message should be logged');
    await defaultLogger.error('This ERROR message should be logged');

    // Server logger (should log WARN and above)
    console.log('\nServer logger (src/server/api):');
    await serverLogger.debug('This DEBUG message should NOT be logged'); // Filtered out
    await serverLogger.info('This INFO message should NOT be logged');   // Filtered out
    await serverLogger.warn('This WARN message should be logged');
    await serverLogger.error('This ERROR message should be logged');

    // UI logger (should log DEBUG and above)
    console.log('\nUI logger (component/ui.tsx):');
    await uiLogger.debug('This DEBUG message should be logged');
    await uiLogger.info('This INFO message should be logged');
    await uiLogger.warn('This WARN message should be logged');
    await uiLogger.error('This ERROR message should be logged');

    // Auth logger (should log ERROR and above)
    console.log('\nAuth logger (auth/login):');
    await authLogger.debug('This DEBUG message should NOT be logged'); // Filtered out
    await authLogger.info('This INFO message should NOT be logged');   // Filtered out
    await authLogger.warn('This WARN message should NOT be logged');   // Filtered out
    await authLogger.error('This ERROR message should be logged');

    // You can also configure log levels programmatically
    console.log('\nConfiguring log levels programmatically:');
    NeuralLog.configure({
      defaultLogLevel: LogLevel.WARN,
      logLevelPatterns: [
        { pattern: 'dynamic/*', level: LogLevel.DEBUG }
      ]
    });

    const dynamicLogger = NeuralLog.Log('dynamic/component');
    await dynamicLogger.debug('This DEBUG message should be logged (from dynamic pattern)');

    // Get log entries to see what was actually logged
    console.log('\nRetrieving logs to see what was actually logged:');
    const defaultEntries = await defaultLogger.get();
    console.log(`Default logger entries: ${defaultEntries.length}`);

    const serverEntries = await serverLogger.get();
    console.log(`Server logger entries: ${serverEntries.length}`);

    const uiEntries = await uiLogger.get();
    console.log(`UI logger entries: ${uiEntries.length}`);

    const authEntries = await authLogger.get();
    console.log(`Auth logger entries: ${authEntries.length}`);

    const dynamicEntries = await dynamicLogger.get();
    console.log(`Dynamic logger entries: ${dynamicEntries.length}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
