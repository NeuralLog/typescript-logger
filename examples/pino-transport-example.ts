import pino from 'pino';
import { pinoAILogger } from '../src/transports';

/**
 * This example demonstrates how to use the Pino transport.
 */
async function main() {
  try {
    // Create Pino logger with AILogger transport
    const logger = pino({
      level: 'info',
      transport: {
        targets: [
          // Standard console target
          { target: 'pino-pretty' },

          // AILogger target
          {
            target: pinoAILogger,
            options: {
              logName: 'pino-example'
            }
          }
        ]
      }
    });

    // Use the logger as normal - logs will be sent to both console and AILogger
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
      if (error instanceof Error) {
        logger.error({
          err: error,
          operationId: '12345'
        }, 'Error in operation');
      }
    }

    console.log('Logs sent to both console and AILogger');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
