import LoggerInstance from '@/loaders/logger';
import { Service } from 'typedi';
import { LogEntry } from 'winston';

@Service()
export default class LoggerService {
  loggerInstance = LoggerInstance;
  constructor() {
    console.info('LoggerService!!');
  }
  log(message: string, ...args: any[]) {
    const level = 'info';
    this.loggerInstance.log(level, message, ...args);
  }
  error(message: string, ...args: any[]) {
    this.loggerInstance.error(message, ...args);
  }
}
