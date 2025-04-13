import axios from 'axios';
import { AILogger, LogLevel } from './AILogger';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AILogger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create a logger with default options', () => {
      const logger = new AILogger('test-log');
      expect(logger).toBeInstanceOf(AILogger);
    });

    it('should create a logger with custom options', () => {
      const logger = new AILogger('test-log', {
        serverUrl: 'http://custom-server:3030',
        defaultLevel: LogLevel.DEBUG,
        includeTimestamps: false
      });
      expect(logger).toBeInstanceOf(AILogger);
    });
  });

  describe('log', () => {
    it('should log a message at the specified level', async () => {
      const logger = new AILogger('test-log');
      const mockResponse = { data: { logId: '12345' } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const logId = await logger.log(LogLevel.INFO, 'Test message');

      expect(logId).toBe('12345');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3030/logs/test-log',
        expect.objectContaining({
          level: LogLevel.INFO,
          message: 'Test message',
          timestamp: expect.any(String)
        })
      );
    });

    it('should include additional data in the log', async () => {
      const logger = new AILogger('test-log');
      const mockResponse = { data: { logId: '12345' } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const logId = await logger.log(LogLevel.INFO, 'Test message', { userId: '12345' });

      expect(logId).toBe('12345');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3030/logs/test-log',
        expect.objectContaining({
          level: LogLevel.INFO,
          message: 'Test message',
          timestamp: expect.any(String),
          userId: '12345'
        })
      );
    });

    it('should handle errors', async () => {
      const logger = new AILogger('test-log');
      const mockError = new Error('Network error');
      mockedAxios.post.mockRejectedValueOnce(mockError);

      await expect(logger.log(LogLevel.INFO, 'Test message')).rejects.toThrow('Network error');
    });
  });

  describe('convenience methods', () => {
    it('should log a debug message', async () => {
      const logger = new AILogger('test-log');
      const mockResponse = { data: { logId: '12345' } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const logId = await logger.debug('Debug message');

      expect(logId).toBe('12345');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3030/logs/test-log',
        expect.objectContaining({
          level: LogLevel.DEBUG,
          message: 'Debug message'
        })
      );
    });

    it('should log an info message', async () => {
      const logger = new AILogger('test-log');
      const mockResponse = { data: { logId: '12345' } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const logId = await logger.info('Info message');

      expect(logId).toBe('12345');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3030/logs/test-log',
        expect.objectContaining({
          level: LogLevel.INFO,
          message: 'Info message'
        })
      );
    });

    it('should log a warning message', async () => {
      const logger = new AILogger('test-log');
      const mockResponse = { data: { logId: '12345' } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const logId = await logger.warn('Warning message');

      expect(logId).toBe('12345');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3030/logs/test-log',
        expect.objectContaining({
          level: LogLevel.WARN,
          message: 'Warning message'
        })
      );
    });

    it('should log an error message', async () => {
      const logger = new AILogger('test-log');
      const mockResponse = { data: { logId: '12345' } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const logId = await logger.error('Error message');

      expect(logId).toBe('12345');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3030/logs/test-log',
        expect.objectContaining({
          level: LogLevel.ERROR,
          message: 'Error message'
        })
      );
    });

    it('should log a fatal message', async () => {
      const logger = new AILogger('test-log');
      const mockResponse = { data: { logId: '12345' } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const logId = await logger.fatal('Fatal message');

      expect(logId).toBe('12345');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3030/logs/test-log',
        expect.objectContaining({
          level: LogLevel.FATAL,
          message: 'Fatal message'
        })
      );
    });
  });

  describe('clear', () => {
    it('should clear the log', async () => {
      const logger = new AILogger('test-log');
      const mockResponse = { data: { status: 'success' } };
      mockedAxios.delete.mockResolvedValueOnce(mockResponse);

      const result = await logger.clear();

      expect(result).toBe(true);
      expect(mockedAxios.delete).toHaveBeenCalledWith('http://localhost:3030/logs/test-log');
    });

    it('should handle errors', async () => {
      const logger = new AILogger('test-log');
      const mockError = new Error('Network error');
      mockedAxios.delete.mockRejectedValueOnce(mockError);

      await expect(logger.clear()).rejects.toThrow('Network error');
    });
  });

  describe('getEntries', () => {
    it('should get log entries', async () => {
      const logger = new AILogger('test-log');
      const mockEntries = [{ id: '1', message: 'Test message' }];
      const mockResponse = { data: { entries: mockEntries } };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const entries = await logger.getEntries();

      expect(entries).toEqual(mockEntries);
      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:3030/logs/test-log', {
        params: { limit: 100 }
      });
    });

    it('should handle errors', async () => {
      const logger = new AILogger('test-log');
      const mockError = new Error('Network error');
      mockedAxios.get.mockRejectedValueOnce(mockError);

      await expect(logger.getEntries()).rejects.toThrow('Network error');
    });
  });

  describe('search', () => {
    it('should search logs with criteria', async () => {
      const logger = new AILogger('test-log');
      const mockResults = [{ id: '1', message: 'Test message' }];
      const mockResponse = { data: { results: mockResults } };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const results = await logger.search({
        query: 'test',
        logName: 'test-log',
        startTime: '2023-01-01T00:00:00.000Z',
        endTime: '2023-12-31T23:59:59.999Z',
        fieldFilters: { level: 'error' },
        limit: 10
      });

      expect(results).toEqual(mockResults);
      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:3030/search', {
        params: {
          query: 'test',
          log_name: 'test-log',
          start_time: '2023-01-01T00:00:00.000Z',
          end_time: '2023-12-31T23:59:59.999Z',
          'field_level': 'error',
          limit: 10
        }
      });
    });

    it('should handle errors', async () => {
      const logger = new AILogger('test-log');
      const mockError = new Error('Network error');
      mockedAxios.get.mockRejectedValueOnce(mockError);

      await expect(logger.search()).rejects.toThrow('Network error');
    });
  });

  describe('getLogs', () => {
    it('should get all log names', async () => {
      const mockLogs = ['log1', 'log2'];
      const mockResponse = { data: { logs: mockLogs } };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const logs = await AILogger.getLogs();

      expect(logs).toEqual(mockLogs);
      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:3030/logs', {
        params: { limit: 1000 }
      });
    });

    it('should handle errors', async () => {
      const mockError = new Error('Network error');
      mockedAxios.get.mockRejectedValueOnce(mockError);

      await expect(AILogger.getLogs()).rejects.toThrow('Network error');
    });
  });
});
