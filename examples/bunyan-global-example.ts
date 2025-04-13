import bunyan from 'bunyan';
import { AILoggerStream } from '../src/transports/bunyan';

/**
 * This example demonstrates how to integrate AILogger with Bunyan at the global level.
 *
 * In a real application, you would typically create this logger in a separate file
 * and export it for use throughout your application.
 */

// Create a default Bunyan logger with AILogger stream
const logger = bunyan.createLogger({
  name: 'bunyan-global-example',
  streams: [
    { level: 'info', stream: process.stdout },
    {
      level: 'info',
      type: 'raw',
      stream: new AILoggerStream({
        logName: 'bunyan-global-example'
      })
    }
  ]
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

    console.log('All Bunyan logs sent to both stdout and AILogger');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
