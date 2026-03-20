import { Inject, Injectable } from '@nestjs/common';
import { I_LOGGER, ILogger } from 'src/shared/application/logger.interface';
import { IMailService } from './mail.service.interface';

@Injectable()
export class MockMailService implements IMailService {
  constructor(@Inject(I_LOGGER) private readonly _logger: ILogger) {}

  async send(to: string, subject: string, html: string): Promise<void> {
    this._logger.log(`[MAIL] to: ${to} | subject: ${subject}\n${html}`);
  }
}
