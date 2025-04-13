import log from 'loglevel';
import { addAILoggerToLoglevel } from '../src/transports/loglevel';

/**
 * This example demonstrates how to integrate AILogger with Loglevel at the global level.
 *
 * In a real application, you would typically configure this in a separate file
 * and export it for use throughout your application.
 */

// Configure Loglevel
log.setLevel('info');

// Add AILogger to Loglevel's root logger
addAILoggerToLoglevel(log, {
  logName: 'loglevel-global-example'
});

/**
 * In a real application, you would export the configured Loglevel:
 *
 * export default log;
 *
 * And then import it in other files:
 *
 * import log from './logger';
 */

async function main() {
  try {

    // Now you can use Loglevel anywhere in your application
    // and logs will be sent to both the original destination and AILogger

    log.debug('This is a debug message'); // Won't be logged due to level: 'info'
    log.info('This is an info message');
    log.warn('This is a warning message');
    log.error('This is an error message');

    // You can also create named loggers
    const moduleLogger = log.getLogger('module');
    moduleLogger.setLevel('debug');

    // Use the named logger
    moduleLogger.debug('This is a named logger debug message');
    moduleLogger.info('This is a named logger info message');

    console.log('All Loglevel logs sent to both console and AILogger');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
