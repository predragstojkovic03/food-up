import { Module } from '@nestjs/common';
import { MailModule } from 'src/shared/infrastructure/notifications/mail/mail.module';
import { BusinessInvitesService } from './application/business-invites.service';
import { BusinessInvitesRepositoryProvider } from './infrastructure/business-invites.providers';

@Module({
  imports: [MailModule],
  providers: [BusinessInvitesRepositoryProvider, BusinessInvitesService],
  exports: [BusinessInvitesService],
})
export class BusinessInvitesModule {}
