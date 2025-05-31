import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CustomLogger extends Logger {
  constructor() {
    super();
  }

  protected context?: string;
}
