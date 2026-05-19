import { Module } from '@nestjs/common';
import { UserPreferencesService } from './application/user-preferences.service';
import { UserPreferencesRepositoryProvider } from './infrastructure/user-preferences.providers';
import { UserPreferencesController } from './presentation/rest/user-preferences.controller';

@Module({
  controllers: [UserPreferencesController],
  providers: [UserPreferencesRepositoryProvider, UserPreferencesService],
  exports: [UserPreferencesService],
})
export class UserPreferencesModule {}
