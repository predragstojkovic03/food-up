export const I_MAIL_SERVICE = Symbol('IMailService');

export interface IMailService {
  send(to: string, subject: string, html: string): Promise<void>;
}
