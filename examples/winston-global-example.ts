import winston from 'winston';
import { NeuralLogTransport } from '../src/transports/winston';

/**
 * This example demonstrates how to integrate NeuralLog with Winston at the global level.
 */
async function main() {
  try {
    // Add NeuralLog transport to Winston's default logger
    winston.add(new NeuralLogTransport({
      logName: 'winston-global-example',
      level: 'info'
    }));

    // Now you can use Winston anywhere in your application
    // and logs will be sent to both the original destination and NeuralLog

    winston.info('This is a Winston log');
    winston.warn('This is a Winston warning');
    winston.error('This is a Winston error');

    // You can also create custom loggers that will use the global transport
    const customLogger = winston.createLogger({
      level: 'debug',
      format: winston.format.simple(),
      transports: [
        new winston.transports.Console()
      ]
    });

    customLogger.debug('This is a custom Winston logger debug message');
    customLogger.info('This is a custom Winston logger info message');

    console.log('All Winston logs sent to both their original destinations and NeuralLog');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
