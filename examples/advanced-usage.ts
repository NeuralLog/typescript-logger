import { AILogger, LogLevel, SearchCriteria } from '../src';

async function main() {
  try {
    // Create a logger with custom options
    const logger = new AILogger('advanced-example', {
      serverUrl: 'http://localhost:3030',
      defaultLevel: LogLevel.DEBUG,
      includeTimestamps: true
    });
    
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
    
    // Search logs with complex criteria
    const searchCriteria: SearchCriteria = {
      query: 'error',
      logName: 'advanced-example',
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Last 24 hours
      endTime: new Date().toISOString(),
      fieldFilters: {
        'level': 'error',
        'data.userId': '12345'
      },
      limit: 100
    };
    
    const results = await logger.search(searchCriteria);
    console.log('Search results:', results);
    
    // Get all log names
    const logs = await AILogger.getLogs();
    console.log('All logs:', logs);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
