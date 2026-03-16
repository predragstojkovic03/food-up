import { Module } from '@nestjs/common';
import { BusinessInvitesService } from './application/business-invites.service';
import { BusinessInvitesRepositoryProvider } from './infrastructure/business-invites.providers';

@Module({
  providers: [BusinessInvitesRepositoryProvider, BusinessInvitesService],
  exports: [BusinessInvitesService],
})
export class BusinessInvitesModule {}
