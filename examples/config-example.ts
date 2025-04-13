import { NeuralLog } from '../src';

/**
 * This example demonstrates the different ways to configure the NeuralLog:
 *
 * 1. Environment variables: NEURALLOG_URL
 * 2. Configuration files:
 *    - .neurallogrc in the current directory
 *    - .neurallogrc.json in the current directory
 *    - neurallog.config.json in the current directory
 *    - .neurallogrc in the user's home directory
 *    - .neurallogrc.json in the user's home directory
 * 3. Programmatic configuration: NeuralLog.configure()
 *
 * The order of precedence is:
 * 1. Environment variables
 * 2. Programmatic configuration
 * 3. Configuration files
 */

async function main() {
  try {
    // Method 1: Set environment variable (before running the script)
    // process.env.NEURALLOG_URL = 'http://custom-server:3030';

    // Method 2: Configuration files
    // See the neurallog.config.json file in this directory

    // Method 3: Programmatic configuration
    NeuralLog.configure({
      serverUrl: 'http://programmatic-config:3030'
    });

    // Get a logger
    const logger = NeuralLog.Log('config-example');

    // Log a message
    await logger.info('This message will be sent to the configured server URL');

    // Get log entries
    const entries = await logger.get();
    console.log('Log entries:', entries);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
