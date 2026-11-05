export const I_MAIL_SERVICE = Symbol('IMailService');

export interface MailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
  contentId: string;
}

export interface MailOptions {
  cc?: string;
  replyTo?: string;
  attachments?: MailAttachment[];
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
