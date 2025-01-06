type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: any;
}

export class Logger {
  private static instance: Logger;
  private logEntries: LogEntry[] = [];

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: LogLevel, message: string, context?: any): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context
    };

    this.logEntries.push(entry);
    this.writeToConsole(entry);
  }

  private writeToConsole(entry: LogEntry): void {
    const formattedMessage = `${entry.timestamp} [${entry.level.toUpperCase()}] ${entry.message}`;
    switch (entry.level) {
      case 'debug':
        console.debug(formattedMessage, entry.context);
        break;
      case 'info':
        console.info(formattedMessage, entry.context);
        break;
      case 'warn':
        console.warn(formattedMessage, entry.context);
        break;
      case 'error':
        console.error(formattedMessage, entry.context);
        break;
    }
  }

  debug(message: string, context?: any): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: any): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: any): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: any): void {
    this.log('error', message, context);
  }

  getLogs(): LogEntry[] {
    return [...this.logEntries];
  }

  clear(): void {
    this.logEntries = [];
  }
}

export const logger = Logger.getInstance();
