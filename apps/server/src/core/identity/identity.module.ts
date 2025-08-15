import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  IdentityRepositoryProvider,
  IdentityUseCaseProviders,
} from './infrastructure/identity.providers';
import { Identity } from './infrastructure/persistence/identity-typeorm.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Identity])],
  providers: [IdentityRepositoryProvider, ...IdentityUseCaseProviders],
  exports: [IdentityRepositoryProvider, ...IdentityUseCaseProviders],
})
export class IdentityModule {}
