import { NeuralLog, LogLevel } from '../src';

async function main() {
  try {
    // Configure the global server URL (optional)
    NeuralLog.configure({
      serverUrl: 'http://localhost:3030'
    });

    // Get a logger for a specific log
    const logger = NeuralLog.Log('chaining-example', {
      defaultLevel: LogLevel.DEBUG,
      includeTimestamps: true
    });

    // Chain methods
    await logger
      .clear()
      .info('Starting new log')
      .warn('Warning message')
      .error('Error message', { errorCode: 500 });

    // Log with structured data
    await logger.info('User logged in', {
      userId: '12345',
      username: 'john.doe',
      loginTime: new Date().toISOString()
    });

    // Log errors with stack traces
    try {
      // Some code that might throw an error
      throw new Error('Something went wrong');
    } catch (error) {
      if (error instanceof Error) {
        await logger.error('Error in operation', {
          error: error.message,
          stack: error.stack,
          operationId: '12345'
        });
      }
    }

    // Get log entries
    const entries = await logger.get();
    console.log('Log entries:', entries);

    // Search logs with complex criteria
    const results = await NeuralLog.search({
      query: 'error',
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Last 24 hours
      endTime: new Date().toISOString(),
      fieldFilters: {
        'level': 'error'
      },
      limit: 100
    });
    console.log('Search results:', results);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
