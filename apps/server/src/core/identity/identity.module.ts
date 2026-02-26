import { Module } from '@nestjs/common';
import { IdentityService } from './application/identity.service';
import { IdentityRepositoryProvider } from './infrastructure/identity.providers';

@Module({
  providers: [IdentityRepositoryProvider, IdentityService],
  exports: [IdentityRepositoryProvider, IdentityService],
})
export class IdentityModule {}
