import { NeuralLogClient as ClientSDK } from '@neurallog/typescript-client-sdk';
import { LogLevel, LogEntryData, SearchCriteria } from './NeuralLog';

/**
 * NeuralLog client wrapper for the typescript-logger
 * 
 * This class wraps the client SDK to provide a simpler interface for the logger
 */
export class NeuralLogClient {
  private client: ClientSDK;
  private tenantId: string;
  private apiKey?: string;
  
  /**
   * Create a new NeuralLogClient
   * 
   * @param serverUrl Server URL
   * @param authUrl Auth URL
   * @param tenantId Tenant ID
   * @param apiKey API key
   */
  constructor(serverUrl: string, authUrl: string, tenantId: string = 'default', apiKey?: string) {
    this.tenantId = tenantId;
    this.apiKey = apiKey;
    
    // Create client SDK instance
    this.client = new ClientSDK({
      tenantId,
      apiUrl: serverUrl,
      authUrl,
      apiKey
    });
    
    // Initialize client
    this.client.initialize().catch(error => {
      console.error('Failed to initialize NeuralLog client:', error);
    });
    
    // Authenticate with API key if provided
    if (apiKey) {
      this.client.authenticateWithApiKey(apiKey).catch(error => {
        console.error('Failed to authenticate with API key:', error);
      });
    }
  }
  
  /**
   * Log data to the specified log
   * 
   * @param logName Log name
   * @param data Log data
   * @returns Promise that resolves to the log ID
   */
  public async log(logName: string, data: LogEntryData): Promise<string> {
    try {
      // Ensure client is authenticated
      if (!this.client.isAuthenticated() && this.apiKey) {
        await this.client.authenticateWithApiKey(this.apiKey);
      }
      
      // Log data
      return await this.client.log(logName, data);
    } catch (error) {
      console.error(`Failed to log data to ${logName}:`, error);
      throw error;
    }
  }
  
  /**
   * Get logs for the specified log name
   * 
   * @param logName Log name
   * @param limit Maximum number of logs to return
   * @returns Promise that resolves to the logs
   */
  public async getLogs(logName: string, limit: number = 100): Promise<any[]> {
    try {
      // Ensure client is authenticated
      if (!this.client.isAuthenticated() && this.apiKey) {
        await this.client.authenticateWithApiKey(this.apiKey);
      }
      
      // Get logs
      return await this.client.getLogs(logName, { limit });
    } catch (error) {
      console.error(`Failed to get logs for ${logName}:`, error);
      throw error;
    }
  }
  
  /**
   * Search logs
   * 
   * @param criteria Search criteria
   * @returns Promise that resolves to the search results
   */
  public async search(criteria: SearchCriteria): Promise<any[]> {
    try {
      // Ensure client is authenticated
      if (!this.client.isAuthenticated() && this.apiKey) {
        await this.client.authenticateWithApiKey(this.apiKey);
      }
      
      // Search logs
      if (criteria.logName) {
        return await this.client.searchLogs(criteria.logName, {
          query: criteria.query || '',
          limit: criteria.limit
        });
      } else {
        // Get all logs and filter client-side
        const allLogs = await this.client.getAllLogs({ limit: criteria.limit });
        
        // Filter logs based on criteria
        return allLogs.filter(log => {
          // Filter by query
          if (criteria.query && !JSON.stringify(log).includes(criteria.query)) {
            return false;
          }
          
          // Filter by start time
          if (criteria.startTime && new Date(log.timestamp) < new Date(criteria.startTime)) {
            return false;
          }
          
          // Filter by end time
          if (criteria.endTime && new Date(log.timestamp) > new Date(criteria.endTime)) {
            return false;
          }
          
          // Filter by field values
          if (criteria.fieldFilters) {
            for (const [field, value] of Object.entries(criteria.fieldFilters)) {
              if (log[field] !== value) {
                return false;
              }
            }
          }
          
          return true;
        });
      }
    } catch (error) {
      console.error('Failed to search logs:', error);
      throw error;
    }
  }
  
  /**
   * Clear a log
   * 
   * @param logName Log name
   * @returns Promise that resolves when the log is cleared
   */
  public async clearLog(logName: string): Promise<void> {
    try {
      // Ensure client is authenticated
      if (!this.client.isAuthenticated() && this.apiKey) {
        await this.client.authenticateWithApiKey(this.apiKey);
      }
      
      // TODO: Implement clear log in the client SDK
      // For now, we'll just log a message
      console.warn('Clear log not implemented in the client SDK');
    } catch (error) {
      console.error(`Failed to clear log ${logName}:`, error);
      throw error;
    }
  }
  
  /**
   * Get all log names
   * 
   * @returns Promise that resolves to the log names
   */
  public async getLogNames(): Promise<string[]> {
    try {
      // Ensure client is authenticated
      if (!this.client.isAuthenticated() && this.apiKey) {
        await this.client.authenticateWithApiKey(this.apiKey);
      }
      
      // Get all logs
      const allLogs = await this.client.getAllLogs();
      
      // Extract unique log names
      const logNames = new Set<string>();
      for (const log of allLogs) {
        if (log.name) {
          logNames.add(log.name);
        }
      }
      
      return Array.from(logNames);
    } catch (error) {
      console.error('Failed to get log names:', error);
      throw error;
    }
  }
  
  /**
   * Get statistics for a log
   * 
   * @param logName Log name
   * @returns Promise that resolves to the log statistics
   */
  public async getLogStatistics(logName: string): Promise<any> {
    try {
      // Ensure client is authenticated
      if (!this.client.isAuthenticated() && this.apiKey) {
        await this.client.authenticateWithApiKey(this.apiKey);
      }
      
      // TODO: Implement get log statistics in the client SDK
      // For now, we'll just return a placeholder
      return {
        count: 0,
        lastUpdated: new Date().toISOString(),
        levelCounts: {
          [LogLevel.DEBUG]: 0,
          [LogLevel.INFO]: 0,
          [LogLevel.WARN]: 0,
          [LogLevel.ERROR]: 0,
          [LogLevel.FATAL]: 0
        }
      };
    } catch (error) {
      console.error(`Failed to get statistics for log ${logName}:`, error);
      throw error;
    }
  }
  
  /**
   * Get aggregate statistics for all logs
   * 
   * @returns Promise that resolves to the aggregate statistics
   */
  public async getAggregateStatistics(): Promise<any> {
    try {
      // Ensure client is authenticated
      if (!this.client.isAuthenticated() && this.apiKey) {
        await this.client.authenticateWithApiKey(this.apiKey);
      }
      
      // TODO: Implement get aggregate statistics in the client SDK
      // For now, we'll just return a placeholder
      return {
        totalLogs: 0,
        totalEntries: 0,
        lastUpdated: new Date().toISOString(),
        levelCounts: {
          [LogLevel.DEBUG]: 0,
          [LogLevel.INFO]: 0,
          [LogLevel.WARN]: 0,
          [LogLevel.ERROR]: 0,
          [LogLevel.FATAL]: 0
        }
      };
    } catch (error) {
      console.error('Failed to get aggregate statistics:', error);
      throw error;
    }
  }
}
