import { Inject, Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { EnvironmentVariables } from 'src/env.validation';
import {
  I_CONFIG_SERVICE,
  IConfigService,
} from 'src/shared/application/config-service.interface';
import { IMailService, MailOptions } from './mail.service.interface';

@Injectable()
export class ResendMailService implements IMailService {
  private readonly _resend: Resend;
  private readonly _from: string;

  constructor(
    @Inject(I_CONFIG_SERVICE)
    configService: IConfigService<EnvironmentVariables, true>,
  ) {
    this._resend = new Resend(configService.getOrThrow('RESEND_API_KEY'));
    this._from = configService.getOrThrow('MAIL_FROM');
  }

  async send(
    to: string,
    subject: string,
    html: string,
    options?: MailOptions,
  ): Promise<void> {
    const { error } = await this._resend.emails.send({
      from: this._from,
      to,
      subject,
      html,
      cc: options?.cc,
      replyTo: options?.replyTo,
    });
    if (error) {
      throw new Error(`Failed to send email to ${to}: ${error.message}`);
    }
  }

  async sendBatch(
    emails: Array<{ to: string; subject: string; html: string }>,
    options?: MailOptions,
  ): Promise<void> {
    const { error } = await this._resend.batch.send(
      emails.map((e) => ({
        from: this._from,
        to: e.to,
        subject: e.subject,
        html: e.html,
        cc: options?.cc,
        reply_to: options?.replyTo,
      })),
    );
    if (error) {
      throw new Error(`Batch send failed: ${error.message}`);
    }
  }
}
