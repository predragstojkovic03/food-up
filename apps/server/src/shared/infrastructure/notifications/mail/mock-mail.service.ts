import { Inject, Injectable } from '@nestjs/common';
import { I_LOGGER, ILogger } from 'src/shared/application/logger.interface';
import { IMailService, MailOptions } from './mail.service.interface';

@Injectable()
export class MockMailService implements IMailService {
  constructor(@Inject(I_LOGGER) private readonly _logger: ILogger) {}

  async send(
    to: string,
    subject: string,
    html: string,
    options?: MailOptions,
  ): Promise<void> {
    const cc = options?.cc ? ` | cc: ${options.cc}` : '';
    this._logger.log(`[MAIL] to: ${to}${cc} | subject: ${subject}\n${html}`);
  }

  async sendBatch(
    emails: Array<{ to: string; subject: string; html: string }>,
    options?: MailOptions,
  ): Promise<void> {
    const cc = options?.cc ? ` | cc: ${options.cc}` : '';
    emails.forEach(({ to, subject, html }) => {
      this._logger.log(`[MAIL] to: ${to}${cc} | subject: ${subject}\n${html}`);
    });
  }
}
