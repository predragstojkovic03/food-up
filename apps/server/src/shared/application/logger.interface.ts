export const I_LOGGER = Symbol('I_LOGGER');

export interface ILogger {
  log(message: string, context?: string): void;
  error(message: string, context?: string): void;
  warn(message: string, context?: string): void;
  debug(message: string, context?: string): void;
  verbose(message: string, context?: string): void;
}
