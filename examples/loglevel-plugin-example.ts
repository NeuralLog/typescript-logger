import log from 'loglevel';
import { addAIMCPLoggerToLoglevel } from '../src/transports';

/**
 * This example demonstrates how to add AI-MCP-Logger to Loglevel.
 */
async function main() {
  try {
    // Configure Loglevel
    log.setLevel('info');
    
    // Add AI-MCP-Logger to Loglevel
    const removePlugin = addAIMCPLoggerToLoglevel(log, {
      logName: 'loglevel-example'
    });
    
    // Use Loglevel as normal - logs will be sent to both console and AI-MCP-Logger
    log.debug('This is a debug message'); // Won't be logged due to level: 'info'
    log.info('This is an info message');
    log.warn('This is a warning message');
    log.error('This is an error message');
    
    // Log with structured data
    log.info('User logged in', {
      userId: '12345',
      username: 'john.doe',
      loginTime: new Date().toISOString()
    });
    
    // Log errors with stack traces
    try {
      // Some code that might throw an error
      throw new Error('Something went wrong');
    } catch (error) {
      log.error('Error in operation', error);
    }
    
    // Remove plugin if needed
    // removePlugin();
    
    console.log('Logs sent to both console and AI-MCP-Logger');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
