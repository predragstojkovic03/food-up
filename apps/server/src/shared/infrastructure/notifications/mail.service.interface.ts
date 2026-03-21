export const I_MAIL_SERVICE = Symbol('IMailService');

export interface MailOptions {
  cc?: string;
}

export interface IMailService {
  send(
    to: string,
    subject: string,
    html: string,
    options?: MailOptions,
  ): Promise<void>;
  sendBatch(
    emails: Array<{ to: string; subject: string; html: string }>,
    options?: MailOptions,
  ): Promise<void>;
}
