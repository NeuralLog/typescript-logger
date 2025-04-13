import { AILogger, LogLevel } from '../src';

async function main() {
  try {
    // Create a logger
    const logger = new AILogger('example-log');
    
    // Log messages at different levels
    await logger.debug('This is a debug message');
    await logger.info('This is an info message');
    await logger.warn('This is a warning message');
    await logger.error('This is an error message', { errorCode: 500 });
    await logger.fatal('This is a fatal message', { errorCode: 999 });
    
    // Get log entries
    const entries = await logger.getEntries();
    console.log('Log entries:', entries);
    
    // Search logs
    const results = await logger.search({
      query: 'error',
      limit: 10
    });
    console.log('Search results:', results);
    
    // Get all log names
    const logs = await AILogger.getLogs();
    console.log('All logs:', logs);
    
    // Clear the log
    await logger.clear();
    console.log('Log cleared');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
