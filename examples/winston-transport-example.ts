import winston from 'winston';
import { AILoggerTransport } from '../src/transports';

/**
 * This example demonstrates how to use the Winston transport.
 */
async function main() {
  try {
    // Create Winston logger with AILogger transport
    const logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        // Standard console transport
        new winston.transports.Console(),

        // AILogger transport
        new AILoggerTransport({
          logName: 'winston-example',
          level: 'info'
        })
      ]
    });

    // Use the logger as normal - logs will be sent to both console and AILogger
    logger.debug('This is a debug message'); // Won't be logged due to level: 'info'
    logger.info('This is an info message');
    logger.warn('This is a warning message');
    logger.error('This is an error message', { errorCode: 500 });

    // Log with structured data
    logger.info('User logged in', {
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
        logger.error('Error in operation', {
          error: error.message,
          stack: error.stack,
          operationId: '12345'
        });
      }
    }

    console.log('Logs sent to both Winston Console transport and AILogger');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
