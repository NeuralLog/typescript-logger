# Console Override for AI-MCP-Logger

This module allows you to override the global console to send logs to AI-MCP-Logger.

## Installation

```bash
npm install @ai-mcp-logger/typescript
```

## Usage

### Basic Usage

```typescript
import { overrideConsole } from '@ai-mcp-logger/typescript/transports/console';

// Override console
const restoreConsole = overrideConsole({
  logName: 'my-app'
});

// Use console as normal
console.log('Hello, world!');
console.info('This is an info message');
console.warn('This is a warning message');
console.error('This is an error message');

// Restore original console if needed
// restoreConsole();
```

### Global Integration

To integrate AI-MCP-Logger with console at the global level, you can override the console at the entry point of your application:

```typescript
// index.ts - Entry point of your application
import { overrideConsole } from '@ai-mcp-logger/typescript/transports/console';

// Override console at the start of your application
overrideConsole({
  logName: 'my-app',
  preserveOriginal: true // Keep original console behavior (default)
});

// Now you can use console anywhere in your application
console.log('Hello, world!');
```

You can also create a setup module that configures console and exports a restore function:

```typescript
// logger.ts - Configure console and export restore function
import { overrideConsole } from '@ai-mcp-logger/typescript/transports/console';

// Override console
const restoreConsole = overrideConsole({
  logName: 'my-app'
});

// Export the restore function
export { restoreConsole };
```

See the [console-override-example.ts](../../../examples/console-override-example.ts) file for a complete example.

## Options

The `overrideConsole` function accepts the following options:

- `logName` (required): Name of the log in AI-MCP-Logger
- `includeTimestamps` (optional): Whether to include timestamps in logs (default: true)
- `preserveOriginal` (optional): Whether to preserve the original console behavior (default: true)

## Level Mapping

Console methods are mapped to AI-MCP-Logger log levels as follows:

| Console Method | AI-MCP-Logger Level |
|----------------|---------------------|
| console.error  | ERROR               |
| console.warn   | WARN                |
| console.info   | INFO                |
| console.log    | INFO                |
| console.debug  | DEBUG               |
