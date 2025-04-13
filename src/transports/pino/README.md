# Pino Transport for AI-MCP-Logger

This transport allows you to send Pino logs to AI-MCP-Logger.

## Installation

```bash
npm install @ai-mcp-logger/typescript
```

## Usage

### Basic Usage

```typescript
import pino from 'pino';
import { pinoAIMCPLogger } from '@ai-mcp-logger/typescript/transports/pino';

// Create Pino logger with AI-MCP-Logger transport
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

// Use Pino as normal
logger.info('Hello, world!');
```

### Global Integration

To integrate AI-MCP-Logger with Pino at the global level, you can create a default logger and export it for use throughout your application:

```typescript
// logger.ts - Create and export a default logger
import pino from 'pino';
import { pinoAIMCPLogger } from '@ai-mcp-logger/typescript/transports/pino';

// Create a default Pino logger with AI-MCP-Logger transport
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

See the [pino-global-example.ts](../../../examples/pino-global-example.ts) file for a complete example.

## Options

The `pinoAIMCPLogger` target accepts the following options:

- `logName` (required): Name of the log in AI-MCP-Logger
- `includeTimestamps` (optional): Whether to include timestamps in logs (default: true)

## Level Mapping

Pino log levels are mapped to AI-MCP-Logger log levels as follows:

| Pino Level    | AI-MCP-Logger Level |
|---------------|---------------------|
| 60 (fatal)    | FATAL               |
| 50 (error)    | ERROR               |
| 40 (warn)     | WARN                |
| 30 (info)     | INFO                |
| 20 (debug)    | DEBUG               |
| 10 (trace)    | DEBUG               |
