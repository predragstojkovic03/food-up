import { Module } from '@nestjs/common';
import { I_MAIL_SERVICE } from './mail.service.interface';
import { ResendMailService } from './resend-mail.service';

@Module({
  providers: [{ provide: I_MAIL_SERVICE, useClass: ResendMailService }],
  exports: [I_MAIL_SERVICE],
})
export class MailModule {}
