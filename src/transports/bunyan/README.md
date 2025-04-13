# Bunyan Stream for AI-MCP-Logger

This stream allows you to send Bunyan logs to AI-MCP-Logger.

## Installation

```bash
npm install @ai-mcp-logger/typescript
```

## Usage

### Basic Usage

```typescript
import bunyan from 'bunyan';
import { AIMCPLoggerStream } from '@ai-mcp-logger/typescript/transports/bunyan';

// Create Bunyan logger with AI-MCP-Logger stream
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

// Use Bunyan as normal
logger.info('Hello, world!');
```

### Global Integration

To integrate AI-MCP-Logger with Bunyan at the global level, you can create a default logger and export it for use throughout your application:

```typescript
// logger.ts - Create and export a default logger
import bunyan from 'bunyan';
import { AIMCPLoggerStream } from '@ai-mcp-logger/typescript/transports/bunyan';

// Create a default Bunyan logger with AI-MCP-Logger stream
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

// Export the logger for use throughout your application
export default logger;
```

Then in your application files:

```typescript
// app.ts
import logger from './logger';

// Use the logger anywhere in your application
logger.info('Hello, world!');
```

See the [bunyan-global-example.ts](../../../examples/bunyan-global-example.ts) file for a complete example.

## Options

The `AIMCPLoggerStream` constructor accepts the following options:

- `logName` (required): Name of the log in AI-MCP-Logger
- `includeTimestamps` (optional): Whether to include timestamps in logs (default: true)
- `type` (optional): Bunyan stream type (default: 'raw')

## Level Mapping

Bunyan log levels are mapped to AI-MCP-Logger log levels as follows:

| Bunyan Level | AI-MCP-Logger Level |
|--------------|---------------------|
| 60 (FATAL)   | FATAL               |
| 50 (ERROR)   | ERROR               |
| 40 (WARN)    | WARN                |
| 30 (INFO)    | INFO                |
| 20 (DEBUG)   | DEBUG               |
| 10 (TRACE)   | DEBUG               |
