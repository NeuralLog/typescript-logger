import { overrideConsole } from '../src/transports/console';

/**
 * This example demonstrates how to integrate AI-MCP-Logger with console at the global level.
 *
 * In a real application, you would typically do this at the entry point of your application.
 */
async function main() {
  try {
    // Override console to send logs to AI-MCP-Logger
    const restoreConsole = overrideConsole({
      logName: 'console-example',
      preserveOriginal: true // Keep original console behavior (default)
    });

    // Use console as normal - logs will be sent to both console and AI-MCP-Logger
    console.debug('This is a debug message');
    console.log('This is a log message');
    console.info('This is an info message');
    console.warn('This is a warning message');
    console.error('This is an error message');

    // Log with structured data
    console.info('User logged in', {
      userId: '12345',
      username: 'john.doe',
      loginTime: new Date().toISOString()
    });

    // Log errors with stack traces
    try {
      // Some code that might throw an error
      throw new Error('Something went wrong');
    } catch (error) {
      console.error('Error in operation', error);
    }

    // Restore original console if needed
    // restoreConsole();

    console.log('Logs sent to both console and AI-MCP-Logger');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
