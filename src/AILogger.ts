import { LogLevel } from '@neurallog/shared';
import { NeuralLogClient } from '@neurallog/client-sdk';

/**
 * Log entry data
 */
export interface LogEntryData {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: any;
}

/**
 * Search criteria for logs
 */
export interface SearchCriteria {
  /**
   * Text to search for across all logs
   */
  query?: string;

  /**
   * Specific log to search (if omitted, searches all logs)
   */
  logName?: string;

  /**
   * Filter entries after this timestamp (ISO format)
   */
  startTime?: string;

  /**
   * Filter entries before this timestamp (ISO format)
   */
  endTime?: string;

  /**
   * Filter by specific field values, e.g. {"level": "error"}
   */
  fieldFilters?: Record<string, any>;

  /**
   * Maximum number of entries to return
   */
  limit?: number;
}

/**
 * AILogger options
 */
export interface AILoggerOptions {
  /**
   * Server URL
   */
  serverUrl?: string;

  /**
   * Auth URL
   */
  authUrl?: string;

  /**
   * Logs URL
   */
  logsUrl?: string;

  /**
   * Default log level
   */
  defaultLevel?: LogLevel;

  /**
   * Whether to include timestamps automatically
   */
  includeTimestamps?: boolean;

  /**
   * Tenant ID
   */
  tenantId?: string;

  /**
   * API key for authentication
   */
  apiKey?: string;

  /**
   * Master secret for key derivation
   */
  masterSecret?: string;
}

/**
 * AILogger
 *
 * A simple logger for AI tools that logs to the AI-MCP-Logger server.
 *
 * Example:
 * ```typescript
 * const logger = new AILogger('my-component');
 * logger.info('Hello, world!');
 * logger.error('Something went wrong', { error: 'Error message' });
 * ```
 */
export class AILogger {
  private logName: string;
  private defaultLevel: LogLevel;
  private includeTimestamps: boolean;
  private client: NeuralLogClient;

  /**
   * Create a new AILogger
   *
   * @param logName Name of the log
   * @param options Logger options
   */
  constructor(logName: string, options: AILoggerOptions = {}) {
    this.logName = logName;
    this.defaultLevel = options.defaultLevel || LogLevel.INFO;
    this.includeTimestamps = options.includeTimestamps !== false; // Default to true

    // Initialize client
    this.client = new NeuralLogClient({
      tenantId: options.tenantId || 'default',
      apiUrl: options.serverUrl,
      authUrl: options.authUrl,
      logsUrl: options.logsUrl
    });

    // Authenticate with API key if provided
    if (options.apiKey) {
      this.client.authenticateWithApiKey(options.apiKey)
        .catch(error => console.error('Error authenticating with API key:', error));
    }

    // Initialize with master secret if provided
    if (options.masterSecret) {
      // TODO: Implement master secret initialization when client-sdk supports it
    }
  }

  /**
   * Log a message at the specified level
   *
   * @param level Log level
   * @param message Message to log
   * @param data Additional data to log
   * @returns Promise that resolves with the log ID when the log is written
   */
  public async log(level: LogLevel, message: string, data: Record<string, any> = {}): Promise<string> {
    try {
      // Create log entry data
      const logData: LogEntryData = {
        level,
        message,
        timestamp: this.includeTimestamps ? new Date().toISOString() : data.timestamp || new Date().toISOString(),
        ...data
      };

      // Use the client-sdk to log the data
      return await this.client.log(this.logName, logData);
    } catch (error) {
      console.error(`Error logging to ${this.logName}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Log a debug message
   *
   * @param message Message to log
   * @param data Additional data to log
   * @returns Promise that resolves with the log ID when the log is written
   */
  public async debug(message: string, data: Record<string, any> = {}): Promise<string> {
    return this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Log an info message
   *
   * @param message Message to log
   * @param data Additional data to log
   * @returns Promise that resolves with the log ID when the log is written
   */
  public async info(message: string, data: Record<string, any> = {}): Promise<string> {
    return this.log(LogLevel.INFO, message, data);
  }

  /**
   * Log a warning message
   *
   * @param message Message to log
   * @param data Additional data to log
   * @returns Promise that resolves with the log ID when the log is written
   */
  public async warn(message: string, data: Record<string, any> = {}): Promise<string> {
    return this.log(LogLevel.WARN, message, data);
  }

  /**
   * Log an error message
   *
   * @param message Message to log
   * @param data Additional data to log
   * @returns Promise that resolves with the log ID when the log is written
   */
  public async error(message: string, data: Record<string, any> = {}): Promise<string> {
    return this.log(LogLevel.ERROR, message, data);
  }

  /**
   * Log a fatal message
   *
   * @param message Message to log
   * @param data Additional data to log
   * @returns Promise that resolves with the log ID when the log is written
   */
  public async fatal(message: string, data: Record<string, any> = {}): Promise<string> {
    return this.log(LogLevel.FATAL, message, data);
  }

  /**
   * Clear the log
   *
   * @returns Promise that resolves when the log is cleared
   */
  public async clear(): Promise<boolean> {
    try {
      await this.client.clearLog(this.logName);
      return true;
    } catch (error) {
      console.error(`Error clearing log ${this.logName}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Get log entries
   *
   * @param limit Maximum number of entries to return
   * @returns Promise that resolves with the log entries
   */
  public async getEntries(limit: number = 100): Promise<any[]> {
    try {
      return await this.client.getLogs(this.logName, { limit });
    } catch (error) {
      console.error(`Error getting log entries for ${this.logName}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Search logs
   *
   * @param criteria Search criteria
   * @returns Promise that resolves with the search results
   */
  public async search(criteria: SearchCriteria = {}): Promise<any[]> {
    try {
      return await this.client.searchLogs(criteria.logName || this.logName, {
        query: criteria.query || '',
        limit: criteria.limit,
        startTime: criteria.startTime,
        endTime: criteria.endTime,
        fields: criteria.fieldFilters ? Object.keys(criteria.fieldFilters) : undefined
      });
    } catch (error) {
      console.error(`Error searching logs: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }



  /**
   * Get all log names
   *
   * @param options Options for getting logs
   * @returns Promise that resolves with the log names
   */
  public static async getLogs(options: {
    serverUrl?: string;
    authUrl?: string;
    logsUrl?: string;
    tenantId?: string;
    apiKey?: string;
    limit?: number;
  } = {}): Promise<string[]> {
    try {
      // Create a temporary client
      const client = new NeuralLogClient({
        tenantId: options.tenantId || 'default',
        apiUrl: options.serverUrl,
        authUrl: options.authUrl,
        logsUrl: options.logsUrl
      });

      // Authenticate if API key is provided
      if (options.apiKey) {
        await client.authenticateWithApiKey(options.apiKey);
      }

      // Get log names
      return await client.getLogNames();
    } catch (error) {
      console.error(`Error getting logs: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }


}
