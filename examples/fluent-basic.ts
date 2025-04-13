import { NeuralLog } from '../src';

async function main() {
  try {
    // Configure the global server URL (optional)
    NeuralLog.configure({
      serverUrl: 'http://localhost:3030'
    });

    // Get a logger for a specific log
    const logger = NeuralLog.Log('example-log');

    // Log messages at different levels
    await logger.debug('This is a debug message');
    await logger.info('This is an info message');
    await logger.warn('This is a warning message');
    await logger.error('This is an error message', { errorCode: 500 });
    await logger.fatal('This is a fatal message', { errorCode: 999 });

    // Get log entries
    const entries = await logger.get();
    console.log('Log entries:', entries);

    // Search this specific log
    const logResults = await logger.search({
      query: 'error',
      limit: 10
    });
    console.log('Log search results:', logResults);

    // Search all logs
    const allResults = await NeuralLog.search({
      query: 'error',
      limit: 10
    });
    console.log('All search results:', allResults);

    // Get all log names
    const logs = await NeuralLog.getLogs();
    console.log('All logs:', logs);

    // Clear the log
    await logger.clear();
    console.log('Log cleared');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
