# Winston Transport for NeuralLog

This transport allows you to send Winston logs to NeuralLog.

## Installation

```bash
npm install @neurallog/typescript
```

## Usage

### Basic Usage

```typescript
import winston from 'winston';
import { NeuralLogTransport } from '@neurallog/typescript/transports/winston';

// Create Winston logger with NeuralLog transport
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new NeuralLogTransport({
      logName: 'my-app',
      level: 'info'
    })
  ]
});

// Use Winston as normal
logger.info('Hello, world!');
```

### Global Integration

To integrate NeuralLog with Winston at the global level, you can add the transport to Winston's default logger:

```typescript
import winston from 'winston';
import { NeuralLogTransport } from '@neurallog/typescript/transports/winston';

// Add NeuralLog transport to Winston's default logger
winston.add(new NeuralLogTransport({
  logName: 'my-app',
  level: 'info'
}));

// Now you can use Winston anywhere in your application
winston.info('Hello, world!');
```

See the [winston-global-example.ts](../../../examples/winston-global-example.ts) file for a complete example.

## Options

The `NeuralLogTransport` constructor accepts the following options:

- `logName` (required): Name of the log in NeuralLog
- `level` (optional): Minimum log level to send to NeuralLog (default: 'info')
- `includeTimestamps` (optional): Whether to include timestamps in logs (default: true)

## Level Mapping

Winston log levels are mapped to NeuralLog log levels as follows:

| Winston Level | NeuralLog Level |
|---------------|---------------------|
| error         | ERROR               |
| warn          | WARN                |
| info          | INFO                |
| http          | DEBUG               |
| verbose       | DEBUG               |
| debug         | DEBUG               |
| silly         | DEBUG               |
