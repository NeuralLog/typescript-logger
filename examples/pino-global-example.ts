import pino from 'pino';
import { pinoAILogger } from '../src/transports/pino';

/**
 * This example demonstrates how to integrate AILogger with Pino at the global level.
 *
 * In a real application, you would typically create this logger in a separate file
 * and export it for use throughout your application.
 */

// Create a default Pino logger with AILogger transport
const logger = pino({
  level: 'info',
  transport: {
    targets: [
      { target: 'pino-pretty' },
      {
        target: pinoAILogger,
        options: {
          logName: 'pino-global-example'
        }
      }
    ]
  }
});

/**
 * In a real application, you would export this logger:
 *
 * export default logger;
 *
 * And then import it in other files:
 *
 * import logger from './logger';
 */

async function main() {
  try {
    // Use the logger
    logger.debug('This is a debug message'); // Won't be logged due to level: 'info'
    logger.info('This is an info message');
    logger.warn('This is a warning message');
    logger.error('This is an error message');

    // Create a child logger
    const childLogger = logger.child({ component: 'child' });

    // Use the child logger
    childLogger.info('This is a child logger message');
    childLogger.warn('This is a child logger warning');

    console.log('All Pino logs sent to both console and AILogger');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
