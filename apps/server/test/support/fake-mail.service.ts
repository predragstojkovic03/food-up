import {
  IMailService,
  MailOptions,
} from 'src/shared/infrastructure/notifications/mail/mail.service.interface';

export interface SentMail {
  to: string;
  subject: string;
  html: string;
  options?: MailOptions;
}

/** Records emails instead of sending them, so tests can assert on what would go out. */
export class FakeMailService implements IMailService {
  readonly sent: SentMail[] = [];

  async send(to: string, subject: string, html: string, options?: MailOptions): Promise<void> {
    this.sent.push({ to, subject, html, options });
  }

  async sendBatch(
    emails: Array<{ to: string; subject: string; html: string }>,
    options?: MailOptions,
  ): Promise<void> {
    for (const email of emails) this.sent.push({ ...email, options });
  }

  to(address: string): SentMail[] {
    return this.sent.filter((m) => m.to === address);
  }

  clear(): void {
    this.sent.length = 0;
  }
}
