/**
 * Logging utility for authentication events
 */

export interface LogEntry {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: any;
  userId?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep only the last 1000 logs

  log(level: 'info' | 'warn' | 'error' | 'debug', message: string, context?: any, userId?: string) {
    const logEntry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
      userId
    };

    this.logs.push(logEntry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // In a real application, we would also send logs to an external service
    // For now, we'll just log to the console
    this.outputToConsole(logEntry);
  }

  info(message: string, context?: any, userId?: string) {
    this.log('info', message, context, userId);
  }

  warn(message: string, context?: any, userId?: string) {
    this.log('warn', message, context, userId);
  }

  error(message: string, context?: any, userId?: string) {
    this.log('error', message, context, userId);
  }

  debug(message: string, context?: any, userId?: string) {
    this.log('debug', message, context, userId);
  }

  getLogs(): LogEntry[] {
    return [...this.logs]; // Return a copy
  }

  clearLogs() {
    this.logs = [];
  }

  private outputToConsole(entry: LogEntry) {
    const timestamp = entry.timestamp.toISOString();
    const logMessage = `[${timestamp}] [${entry.level.toUpperCase()}] ${entry.message}`;

    switch (entry.level) {
      case 'info':
        console.info(logMessage, entry.context || '');
        break;
      case 'warn':
        console.warn(logMessage, entry.context || '');
        break;
      case 'error':
        console.error(logMessage, entry.context || '');
        break;
      case 'debug':
        console.debug(logMessage, entry.context || '');
        break;
    }
  }
}

export default new Logger();