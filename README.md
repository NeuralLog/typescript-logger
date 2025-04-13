# NeuralLog TypeScript Logger

A fluent TypeScript SDK for the NeuralLog system, designed to make it easy to log structured data from TypeScript/JavaScript applications with intelligent analysis capabilities. It uses the NeuralLog Client SDK for secure, zero-knowledge logging and the shared types from the `@neurallog/shared` package for consistency across the codebase.

## Installation

```bash
# Configure npm to use the private registry for @neurallog scope
npm config set @neurallog:registry http://localhost:4873

# Install the logger
npm install @neurallog/logger --registry http://localhost:4873
```

## Usage

### AILogger

The `AILogger` class provides a simple interface for logging data to the NeuralLog system with zero-knowledge encryption:

```typescript
import { AILogger, LogLevel } from '@neurallog/logger';

// Create a logger
const logger = new AILogger('my-application', {
  apiKey: 'your-api-key',
  tenantId: 'your-tenant-id',
  authUrl: 'https://auth.neurallog.com',
  logsUrl: 'https://logs.neurallog.com'
});

// Log data
await logger.log(LogLevel.INFO, 'Hello, NeuralLog!', {
  user: 'john.doe',
  action: 'login'
});

// Get logs
const logs = await logger.getEntries();
console.log('Recent logs:', logs);

// Search logs
const searchResults = await logger.search({
  query: 'login',
  limit: 10
});
console.log('Search results:', searchResults);
```

### Basic Usage

```typescript
import { NeuralLog, LogLevel } from '@neurallog/logger';

// Configuration is automatically loaded from:
// 1. Environment variables:
//    - NEURALLOG_URL - Sets the server URL
//    - NEURALLOG_DEFAULT_LEVEL - Sets the default log level
// 2. Configuration files (.neurallogrc, neurallog.config.json)
// 3. Default values
//
// You can also configure it programmatically:
NeuralLog.configure({
  serverUrl: 'http://custom-server:3030',
  defaultLogLevel: LogLevel.INFO,
  logLevelPatterns: [
    { pattern: 'src/server/**', level: LogLevel.WARN },
    { pattern: 'component/ui.tsx', level: LogLevel.DEBUG }
  ]
});

// Get a logger for a specific log
const logger = NeuralLog.Log('my-component');

// Log messages at different levels
await logger.debug('This is a debug message');
await logger.info('This is an info message');
await logger.warn('This is a warning message');
await logger.error('This is an error message', { errorCode: 500 });
await logger.fatal('This is a fatal message', { errorCode: 999 });

// Get log entries
const entries = await logger.get();
console.log(entries);

// Search this specific log
const logResults = await logger.search({ query: 'error' });

// Search all logs
const allResults = await NeuralLog.search({ query: 'error' });

// Get all log names
const logs = await NeuralLog.getLogs();

// Clear the log
await logger.clear();
```

### Method Chaining

```typescript
import { NeuralLog, LogLevel } from '@neurallog/logger';

// Get a logger for a specific log
const logger = NeuralLog.Log('my-component', {
  defaultLevel: LogLevel.DEBUG,
  includeTimestamps: true
});

// Chain methods
await logger
  .clear()
  .info('Starting new log')
  .warn('Warning message')
  .error('Error message', { errorCode: 500 });
```

### Advanced Usage

```typescript
import { NeuralLog, LogLevel, SearchCriteria } from '@neurallog/logger';

// Get a logger with custom options
const logger = NeuralLog.Log('my-component', {
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
const results = await NeuralLog.search({
  query: 'error',
  logName: 'my-component',
  startTime: '2023-01-01T00:00:00.000Z',
  endTime: '2023-12-31T23:59:59.999Z',
  fieldFilters: {
    'level': 'error',
    'data.userId': '12345'
  },
  limit: 100
});
```

## API Reference

### NeuralLog Class

#### Static Methods

##### configure

```typescript
static configure(options: GlobalOptions): void
```

Configure global options for the NeuralLog logger.

##### Log

```typescript
static Log(logName: string, options?: LoggerOptions): Logger
```

Get a logger for a specific log.

##### search

```typescript
static async search(criteria?: SearchCriteria, serverUrl?: string): Promise<any[]>
```

Search logs based on criteria in the NeuralLog system.

##### getLogs

```typescript
static async getLogs(limit?: number, serverUrl?: string): Promise<string[]>
```

Get all log names from the NeuralLog system.

### Logger Class

#### Methods

##### log

```typescript
async log(level: LogLevel, message: string, data?: Record<string, any>): Promise<Logger>
```

Log a message at the specified level. Returns the logger instance for chaining.

##### debug, info, warn, error, fatal

```typescript
async debug(message: string, data?: Record<string, any>): Promise<Logger>
async info(message: string, data?: Record<string, any>): Promise<Logger>
async warn(message: string, data?: Record<string, any>): Promise<Logger>
async error(message: string, data?: Record<string, any>): Promise<Logger>
async fatal(message: string, data?: Record<string, any>): Promise<Logger>
```

Convenience methods for logging at specific levels. Each returns the logger instance for chaining.

##### clear

```typescript
async clear(): Promise<Logger>
```

Clear the log. Returns the logger instance for chaining.

##### get

```typescript
async get(limit?: number): Promise<any[]>
```

Get log entries.

##### search

```typescript
async search(criteria?: Omit<SearchCriteria, 'logName'>): Promise<any[]>
```

Search this log. The `logName` is automatically set to this log's name.

##### getName

```typescript
getName(): string
```

Get the name of this log.

### Interfaces and Types

#### LogLevel

The SDK uses the `LogLevel` enum from the `@neurallog/shared` package:

```typescript
/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}
```

#### LogEntryData

```typescript
interface LogEntryData {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: any;
}
```

#### SearchCriteria

```typescript
interface SearchCriteria {
  query?: string;
  logName?: string;
  startTime?: string;
  endTime?: string;
  fieldFilters?: Record<string, any>;
  limit?: number;
}
```

#### LoggerOptions

```typescript
interface LoggerOptions {
  defaultLevel?: LogLevel;
  includeTimestamps?: boolean;
}
```

#### AILoggerOptions

```typescript
interface AILoggerOptions {
  serverUrl?: string;
  authUrl?: string;
  logsUrl?: string;
  defaultLevel?: LogLevel;
  includeTimestamps?: boolean;
  tenantId?: string;
  apiKey?: string;
  masterSecret?: string;
}
```

#### GlobalOptions

```typescript
interface GlobalOptions {
  serverUrl?: string;
}
```

## Integration with Existing Logging Frameworks

AI-MCP-Logger provides transports and plugins for popular logging frameworks, allowing you to send logs to AI-MCP-Logger with minimal changes to your existing code.

### Installation with Transports

To use the transports, you need to install the corresponding logging framework:

```bash
# For Winston
npm install @neurallog/logger winston --registry http://localhost:4873

# For Bunyan
npm install @neurallog/logger bunyan --registry http://localhost:4873

# For Pino
npm install @neurallog/logger pino --registry http://localhost:4873

# For Loglevel
npm install @neurallog/logger loglevel --registry http://localhost:4873
```

### Supported Frameworks

#### Winston

```typescript
import winston from 'winston';
import { AIMCPLoggerTransport } from '@neurallog/logger/transports/winston';

// Instance level integration
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new AIMCPLoggerTransport({
      logName: 'my-app',
      level: 'info'
    })
  ]
});

// Global level integration
winston.add(new AIMCPLoggerTransport({
  logName: 'my-app',
  level: 'info'
}));
```

#### Bunyan

```typescript
import bunyan from 'bunyan';
import { AIMCPLoggerStream } from '@neurallog/logger/transports/bunyan';

// Create Bunyan logger with NeuralLog stream
const logger = bunyan.createLogger({
  name: 'my-app',
  streams: [
    { level: 'info', stream: process.stdout },
    {
      level: 'info',
      type: 'raw',
      stream: new AIMCPLoggerStream({
        logName: 'my-app'
      })
    }
  ]
});
```

#### Pino

```typescript
import pino from 'pino';
import { pinoAIMCPLogger } from '@neurallog/logger/transports/pino';

// Create Pino logger with NeuralLog transport
const logger = pino({
  transport: {
    targets: [
      { target: 'pino-pretty' },
      {
        target: pinoAIMCPLogger,
        options: {
          logName: 'my-app'
        }
      }
    ]
  }
});
```

#### Console

```typescript
import { overrideConsole } from '@neurallog/logger/transports/console';

// Override console
const restoreConsole = overrideConsole({
  logName: 'my-app'
});

// Use console as normal
console.log('Hello, world!');

// Restore original console if needed
// restoreConsole();
```

#### Loglevel

```typescript
import log from 'loglevel';
import { addAIMCPLoggerToLoglevel } from '@neurallog/logger/transports/loglevel';

// Add NeuralLog to Loglevel
addAIMCPLoggerToLoglevel(log, {
  logName: 'my-app'
});

// Use Loglevel as normal
log.info('Hello, world!');
```

For detailed documentation on each transport, see the respective README files in the [transports directory](./src/transports).

## Building and Publishing

To build the SDK:

```bash
npm run build
```

To publish the SDK to the private registry:

```bash
# From the infra directory
./scripts/Publish-SDK.ps1
```

## Integration with NeuralLog Ecosystem

This TypeScript SDK is part of the broader NeuralLog ecosystem, which includes:

1. **Server**: A central logging server that stores and retrieves logs.
2. **MCP Client**: A client that implements the Model Context Protocol for integration with Claude and other AI agents.
3. **TypeScript SDK**: This SDK library.
4. **Client SDK**: A zero-knowledge client SDK for secure logging.
5. **Other Language Clients**: Python, C#, and Java clients for cross-language support.
6. **AI Analysis**: Intelligent log analysis capabilities for extracting insights from your logs.

### Client SDK Integration

This TypeScript SDK is built on top of the NeuralLog Client SDK, which provides the core functionality for interacting with the NeuralLog system. The Client SDK provides:

- **Zero-Knowledge Architecture**: All encryption/decryption happens client-side
- **Secure Logging**: End-to-end encrypted logs
- **Encrypted Log Names**: Log names are encrypted before being sent to the server
- **API Key Management**: Create and manage API keys
- **Searchable Encryption**: Search encrypted logs without compromising security

You can access the Client SDK directly through this package:

```typescript
import { NeuralLogClient } from '@neurallog/logger';

// Create a client
const client = new NeuralLogClient({
  tenantId: 'your-tenant-id',
  authUrl: 'https://auth.neurallog.com',
  logsUrl: 'https://logs.neurallog.com'
});

// Authenticate with API key
await client.authenticateWithApiKey('your-api-key');

// Log data
await client.log('application-logs', {
  level: 'info',
  message: 'Hello, NeuralLog!',
  timestamp: new Date().toISOString()
});

// Retrieve logs
const logs = await client.getLogs('application-logs', { limit: 10 });
console.log('Recent logs:', logs);
```

## Best Practices

1. **Use Structured Data**: Include relevant structured data with log messages for better analysis.
2. **Use Appropriate Log Levels**: Choose the appropriate log level for each message.
3. **Include Context**: Add context information to logs to make them more useful.
4. **Handle Errors**: Properly handle errors when logging to prevent cascading failures.
5. **Clean Up Old Logs**: Regularly clear old logs to prevent excessive storage usage.
