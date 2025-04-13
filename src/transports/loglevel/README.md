# Loglevel Plugin for AI-MCP-Logger

This plugin allows you to send Loglevel logs to AI-MCP-Logger.

## Installation

```bash
npm install @ai-mcp-logger/typescript
```

## Usage

### Basic Usage

```typescript
import log from 'loglevel';
import { addAIMCPLoggerToLoglevel } from '@ai-mcp-logger/typescript/transports/loglevel';

// Add AI-MCP-Logger to Loglevel
addAIMCPLoggerToLoglevel(log, {
  logName: 'my-app'
});

// Use Loglevel as normal
log.info('Hello, world!');
```

### Global Integration

To integrate AI-MCP-Logger with Loglevel at the global level, you can add the plugin to Loglevel's root logger:

```typescript
import log from 'loglevel';
import { addAIMCPLoggerToLoglevel } from '@ai-mcp-logger/typescript/transports/loglevel';

// Configure Loglevel
log.setLevel('info');

// Add AI-MCP-Logger to Loglevel's root logger
addAIMCPLoggerToLoglevel(log, {
  logName: 'my-app'
});

// Now you can use Loglevel anywhere in your application
log.info('Hello, world!');
```

You can also create a setup module that configures Loglevel and export it:

```typescript
// logger.ts - Configure Loglevel and export it
import log from 'loglevel';
import { addAIMCPLoggerToLoglevel } from '@ai-mcp-logger/typescript/transports/loglevel';

// Configure Loglevel
log.setLevel('info');

// Add AI-MCP-Logger to Loglevel
addAIMCPLoggerToLoglevel(log, {
  logName: 'my-app'
});

// Export the configured Loglevel
export default log;
```

See the [loglevel-global-example.ts](../../../examples/loglevel-global-example.ts) file for a complete example.

## Options

The `addAIMCPLoggerToLoglevel` function accepts the following options:

- `logName` (required): Name of the log in AI-MCP-Logger
- `includeTimestamps` (optional): Whether to include timestamps in logs (default: true)

## Level Mapping

Loglevel methods are mapped to AI-MCP-Logger log levels as follows:

| Loglevel Method | AI-MCP-Logger Level |
|-----------------|---------------------|
| error           | ERROR               |
| warn            | WARN                |
| info            | INFO                |
| debug           | DEBUG               |
| trace           | DEBUG               |
