import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdentityService } from './application/identity.service';
import { IdentityRepositoryProvider } from './infrastructure/identity.providers';
import { Identity } from './infrastructure/persistence/identity.typeorm-entity';

@Module({
  imports: [TypeOrmModule.forFeature([Identity])],
  providers: [IdentityRepositoryProvider, IdentityService],
  exports: [IdentityRepositoryProvider, IdentityService],
})
export class IdentityModule {}
