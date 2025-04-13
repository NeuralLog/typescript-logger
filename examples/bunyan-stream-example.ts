import bunyan from 'bunyan';
import { AIMCPLoggerStream } from '../src/transports';

/**
 * This example demonstrates how to use the Bunyan stream.
 */
async function main() {
  try {
    // Create Bunyan logger with AI-MCP-Logger stream
    const logger = bunyan.createLogger({
      name: 'bunyan-example',
      streams: [
        // Standard stdout stream
        {
          level: 'info',
          stream: process.stdout
        },
        
        // AI-MCP-Logger stream
        {
          level: 'info',
          type: 'raw',
          stream: new AIMCPLoggerStream({
            logName: 'bunyan-example'
          })
        }
      ]
    });
    
    // Use the logger as normal - logs will be sent to both stdout and AI-MCP-Logger
    logger.debug('This is a debug message'); // Won't be logged due to level: 'info'
    logger.info('This is an info message');
    logger.warn('This is a warning message');
    logger.error('This is an error message');
    logger.fatal('This is a fatal message');
    
    // Log with structured data
    logger.info({
      userId: '12345',
      username: 'john.doe',
      loginTime: new Date().toISOString()
    }, 'User logged in');
    
    // Log errors with stack traces
    try {
      // Some code that might throw an error
      throw new Error('Something went wrong');
    } catch (error) {
      logger.error({
        err: error,
        operationId: '12345'
      }, 'Error in operation');
    }
    
    console.log('Logs sent to both stdout and AI-MCP-Logger');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
