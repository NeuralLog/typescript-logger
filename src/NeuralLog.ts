import fs from 'fs';
import path from 'path';
import os from 'os';
import { LogEntry, LogResponse, LogNamesResponse, LogStatistics, AggregateStatistics } from '@neurallog/shared';
import { NeuralLogClient } from './NeuralLogClient';

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
  ``
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
 * Logger options
 */
export interface LoggerOptions {
  /**
   * Default log level
   */
  defaultLevel?: LogLevel;

  /**
   * Whether to include timestamps automatically
   */
  includeTimestamps?: boolean;
}

/**
 * Global options for the NeuralLog
 */
export interface GlobalOptions {
  /**
   * Server URL
   */
  serverUrl?: string;

  /**
   * API key for authentication
   */
  apiKey?: string;

  /**
   * Auth service URL for API key verification
   */
  authServiceUrl?: string;

  /**
   * Default log level
   */
  defaultLogLevel?: LogLevel;

  /**
   * Pattern-based log levels
   *
   * Example:
   * ```typescript
   * {
   *   logLevelPatterns: [
   *     { pattern: 'src/server/**', level: LogLevel.WARN },
   *     { pattern: 'component/ui.tsx', level: LogLevel.INFO }
   *   ]
   * }
   * ```
   */
  logLevelPatterns?: Array<{
    pattern: string;
    level: LogLevel;
  }>;
}

/**
 * Logger instance for a specific log
 */
export class Logger {
  private logName: string;
  private serverUrl: string;
  private includeTimestamps: boolean;
  private configManager: ConfigManager;
  private apiKey?: string;

  /**
   * Create a new Logger
   *
   * @param logName Name of the log
   * @param serverUrl Server URL
   * @param options Logger options
   */
  constructor(logName: string, serverUrl: string, options: LoggerOptions = {}) {
    this.logName = logName;
    this.serverUrl = serverUrl;
    this.includeTimestamps = options.includeTimestamps !== false; // Default to true
    this.configManager = ConfigManager.getInstance();
    this.apiKey = this.configManager.getApiKey();
  }

  /**
   * Get the appropriate log level for this logger
   */
  private getLogLevel(): LogLevel {
    return this.configManager.getLogLevel(this.logName);
  }

  /**
   * Log a message at the specified level
   *
   * @param level Log level
   * @param message Message to log
   * @param data Additional data to log
   * @returns This logger instance for chaining
   */
  public async log(level: LogLevel, message: string, data: Record<string, any> = {}): Promise<Logger> {
    try {
      // Check if we should log this message based on configured log level
      const configuredLevel = this.configManager.getLogLevel(this.logName);

      // Skip logging if the message level is less severe than the configured level
      const levelOrder = {
        [LogLevel.DEBUG]: 0,
        [LogLevel.INFO]: 1,
        [LogLevel.WARN]: 2,
        [LogLevel.ERROR]: 3,
        [LogLevel.FATAL]: 4
      };

      if (levelOrder[level] < levelOrder[configuredLevel]) {
        // Skip logging but still return this for chaining
        return this;
      }

      // Create log entry data
      const logData: LogEntryData = {
        level,
        message,
        timestamp: this.includeTimestamps ? new Date().toISOString() : data.timestamp || new Date().toISOString(),
        ...data
      };

      // Get client instance
      const client = NeuralLog.getClient();

      // Send log to server
      await client.log(this.logName, logData);

      return this;
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
   * @returns This logger instance for chaining
   */
  public async debug(message: string, data: Record<string, any> = {}): Promise<Logger> {
    return this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Log an info message
   *
   * @param message Message to log
   * @param data Additional data to log
   * @returns This logger instance for chaining
   */
  public async info(message: string, data: Record<string, any> = {}): Promise<Logger> {
    return this.log(LogLevel.INFO, message, data);
  }

  /**
   * Log a warning message
   *
   * @param message Message to log
   * @param data Additional data to log
   * @returns This logger instance for chaining
   */
  public async warn(message: string, data: Record<string, any> = {}): Promise<Logger> {
    return this.log(LogLevel.WARN, message, data);
  }

  /**
   * Log an error message
   *
   * @param message Message to log
   * @param data Additional data to log
   * @returns This logger instance for chaining
   */
  public async error(message: string, data: Record<string, any> = {}): Promise<Logger> {
    return this.log(LogLevel.ERROR, message, data);
  }

  /**
   * Log a fatal message
   *
   * @param message Message to log
   * @param data Additional data to log
   * @returns This logger instance for chaining
   */
  public async fatal(message: string, data: Record<string, any> = {}): Promise<Logger> {
    return this.log(LogLevel.FATAL, message, data);
  }

  /**
   * Clear the log
   *
   * @returns This logger instance for chaining
   */
  public async clear(): Promise<Logger> {
    try {
      await axios.delete(`${this.serverUrl}/logs/${this.logName}`);
      return this;
    } catch (error) {
      console.error(`Error clearing log ${this.logName}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Get log entries
   *
   * @param limit Maximum number of entries to return
   * @returns Log entries
   */
  public async get(limit: number = 100): Promise<LogEntry[]> {
    try {
      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Tenant-ID': 'default'
      };

      // Add API key if available
      if (this.apiKey) {
        headers['X-API-Key'] = this.apiKey;
      }

      const response = await axios.get<LogResponse>(`${this.serverUrl}/logs/${this.logName}`, {
        params: { limit },
        headers
      });

      return response.data.entries || [];
    } catch (error) {
      console.error(`Error getting log entries for ${this.logName}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Search this log
   *
   * @param criteria Search criteria (logName is automatically set to this log's name)
   * @returns Search results
   */
  public async search(criteria: Omit<SearchCriteria, 'logName'> = {}): Promise<any[]> {
    return NeuralLog.search({
      ...criteria,
      logName: this.logName
    });
  }

  /**
   * Get the name of this log
   *
   * @returns Log name
   */
  public getName(): string {
    return this.logName;
  }
}

/**
 * NeuralLog
 *
 * A fluent interface for the NeuralLog system.
 *
 * Example:
 * ```typescript
 * // Get a logger for a specific log
 * const logger = NeuralLog.Log('my-component');
 *
 * // Log messages
 * await logger.info('Hello, world!');
 * await logger.error('Something went wrong', { error: 'Error message' });
 *
 * // Chain methods
 * await logger
 *   .clear()
 *   .info('Starting new log')
 *   .warn('Warning message');
 *
 * // Get log entries
 * const entries = await logger.get();
 *
 * // Search logs
 * const results = await NeuralLog.search({ query: 'error' });
 * ```
 */
/**
 * Configuration file structure
 */
interface ConfigFile {
  serverUrl?: string;
  apiKey?: string;
  authServiceUrl?: string;
  logLevels?: {
    default?: LogLevel;
    patterns?: Array<{
      pattern: string;
      level: LogLevel;
    }>;
  };
}

/**
 * NeuralLog configuration manager
 */
class ConfigManager {
  private static instance: ConfigManager;
  private config: ConfigFile = {};
  private configPaths: string[] = [];

  /**
   * Get the singleton instance
   */
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    this.loadConfig();
  }

  /**
   * Get the server URL from environment variables, config file, or default
   */
  public getServerUrl(): string {
    // Check environment variables first
    if (typeof process !== 'undefined' && process.env && process.env.NEURALLOG_URL) {
      return process.env.NEURALLOG_URL;
    }

    // Then check config file
    if (this.config.serverUrl) {
      return this.config.serverUrl;
    }

    // Default value
    return 'http://localhost:3030';
  }

  /**
   * Get the API key from environment variables or config file
   */
  public getApiKey(): string | undefined {
    // Check environment variables first
    if (typeof process !== 'undefined' && process.env && process.env.NEURALLOG_API_KEY) {
      return process.env.NEURALLOG_API_KEY;
    }

    // Then check config file
    return this.config.apiKey;
  }

  /**
   * Get the auth service URL from environment variables, config file, or default
   */
  public getAuthServiceUrl(): string {
    // Check environment variables first
    if (typeof process !== 'undefined' && process.env && process.env.NEURALLOG_AUTH_URL) {
      return process.env.NEURALLOG_AUTH_URL;
    }

    // Then check config file
    if (this.config.authServiceUrl) {
      return this.config.authServiceUrl;
    }

    // Default value
    return 'http://localhost:3040';
  }

  /**
   * Get the log level for a specific log name based on pattern matching
   *
   * @param logName The name of the log
   * @returns The appropriate log level
   */
  public getLogLevel(logName: string): LogLevel {
    // Default log level from environment variable
    if (typeof process !== 'undefined' && process.env && process.env.NEURALLOG_DEFAULT_LEVEL) {
      const envLevel = process.env.NEURALLOG_DEFAULT_LEVEL.toLowerCase();
      if (Object.values(LogLevel).includes(envLevel as LogLevel)) {
        return envLevel as LogLevel;
      }
    }

    // Check pattern-based configuration
    if (this.config.logLevels?.patterns) {
      for (const { pattern, level } of this.config.logLevels.patterns) {
        // Convert glob pattern to regex
        const regexPattern = this.globToRegex(pattern);
        if (regexPattern.test(logName)) {
          return level;
        }
      }
    }

    // Use default from config
    if (this.config.logLevels?.default) {
      return this.config.logLevels.default;
    }

    // Fallback default
    return LogLevel.INFO;
  }

  /**
   * Set the default log level
   */
  public setDefaultLogLevel(level: LogLevel): void {
    if (!this.config.logLevels) {
      this.config.logLevels = {};
    }
    this.config.logLevels.default = level;
  }

  /**
   * Add a pattern-based log level
   */
  public addLogLevelPattern(pattern: string, level: LogLevel): void {
    if (!this.config.logLevels) {
      this.config.logLevels = {};
    }
    if (!this.config.logLevels.patterns) {
      this.config.logLevels.patterns = [];
    }
    this.config.logLevels.patterns.push({ pattern, level });
  }

  /**
   * Set the server URL
   */
  public setServerUrl(url: string): void {
    this.config.serverUrl = url;
  }

  /**
   * Set the API key
   */
  public setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
  }

  /**
   * Set the auth service URL
   */
  public setAuthServiceUrl(url: string): void {
    this.config.authServiceUrl = url;
  }

  /**
   * Convert a glob pattern to a regular expression
   *
   * @param pattern The glob pattern (e.g., 'src/server/**')
   * @returns A regular expression that matches the glob pattern
   */
  private globToRegex(pattern: string): RegExp {
    // Replace common glob patterns with regex equivalents
    const regexPattern = pattern
      .replace(/\./g, '\\.')   // Escape dots
      .replace(/\*/g, '.*')     // * becomes .*
      .replace(/\*\*/g, '.*')   // ** also becomes .* (simplification)
      .replace(/\?/g, '.')      // ? becomes .
      .replace(/\//g, '\\/');  // Escape slashes

    // Create a regex that matches the entire string
    return new RegExp(`^${regexPattern}$`);
  }

  /**
   * Load configuration from files
   */
  private loadConfig(): void {
    try {
      // Define possible config file locations
      this.configPaths = [
        // Current working directory
        path.resolve(process.cwd(), '.neurallogrc'),
        path.resolve(process.cwd(), '.neurallogrc.json'),
        path.resolve(process.cwd(), 'neurallog.config.json'),
        // User's home directory
        path.resolve(os.homedir(), '.neurallogrc'),
        path.resolve(os.homedir(), '.neurallogrc.json'),
      ];

      // Try to load from each location
      for (const configPath of this.configPaths) {
        if (fs.existsSync(configPath)) {
          try {
            const configContent = fs.readFileSync(configPath, 'utf8');
            const parsedConfig = JSON.parse(configContent);
            this.config = { ...this.config, ...parsedConfig };
            console.log(`Loaded AI-MCP-Logger configuration from ${configPath}`);
            break;
          } catch (err) {
            console.warn(`Error parsing config file ${configPath}: ${err instanceof Error ? err.message : String(err)}`);
          }
        }
      }
    } catch (err) {
      // Fail silently if there's an error loading the config
      console.warn(`Error loading AI-MCP-Logger configuration: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}

export class NeuralLog {
  private static configManager = ConfigManager.getInstance();
  private static client: NeuralLogClient | null = null;

  /**
   * Get the NeuralLogClient instance
   *
   * @returns The NeuralLogClient instance
   */
  public static getClient(): NeuralLogClient {
    if (!this.client) {
      const serverUrl = this.configManager.getServerUrl();
      const authUrl = this.configManager.getAuthServiceUrl();
      const apiKey = this.configManager.getApiKey();

      this.client = new NeuralLogClient(serverUrl, authUrl, 'default', apiKey);
    }

    return this.client;
  }

  /**
   * Configure global options for the NeuralLog
   *
   * @param options Global options
   */
  public static configure(options: GlobalOptions): void {
    let configChanged = false;

    if (options.serverUrl) {
      this.configManager.setServerUrl(options.serverUrl);
      configChanged = true;
    }

    if (options.apiKey) {
      this.configManager.setApiKey(options.apiKey);
      configChanged = true;
    }

    if (options.authServiceUrl) {
      this.configManager.setAuthServiceUrl(options.authServiceUrl);
      configChanged = true;
    }

    if (options.defaultLogLevel) {
      this.configManager.setDefaultLogLevel(options.defaultLogLevel);
    }

    if (options.logLevelPatterns) {
      for (const { pattern, level } of options.logLevelPatterns) {
        this.configManager.addLogLevelPattern(pattern, level);
      }
    }

    // Reset client if configuration changed
    if (configChanged) {
      this.client = null;
    }
  }

  /**
   * Get a logger for a specific log
   *
   * @param logName Name of the log
   * @param options Logger options
   * @returns Logger instance
   */
  public static Log(logName: string, options: LoggerOptions = {}): Logger {
    // Create a new logger with the configured server URL
    const serverUrl = this.configManager.getServerUrl();
    const apiKey = this.configManager.getApiKey();

    // Initialize the client if not already initialized
    this.getClient();

    return new Logger(logName, serverUrl, {
      ...options,
      apiKey: options.apiKey || apiKey
    });
  }

  /**
   * Search logs
   *
   * @param criteria Search criteria
   * @returns Search results
   */
  public static async search(criteria: SearchCriteria = {}): Promise<any[]> {
    try {
      // Get client instance
      const client = this.getClient();

      // Search logs using the client
      return await client.search(criteria);
    } catch (error) {
      console.error(`Error searching logs: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Get all log names
   *
   * @param limit Maximum number of log names to return
   * @returns Log names
   */
  public static async getLogs(limit: number = 1000): Promise<string[]> {
    try {
      // Get client instance
      const client = this.getClient();

      // Get log names using the client
      return await client.getLogNames();
    } catch (error) {
      console.error(`Error getting logs: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}
