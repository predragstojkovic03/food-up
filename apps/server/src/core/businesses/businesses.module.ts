import { Module } from '@nestjs/common';
import { BusinessInvitesModule } from '../business-invites/business-invites.module';
import { BusinessesService } from './application/businesses.service';
import { BusinessRepositoryProvider } from './infrastructure/business.providers';
import { BusinessesController } from './presentation/rest/businesses.controller';

@Module({
  imports: [BusinessInvitesModule],
  controllers: [BusinessesController],
  providers: [BusinessesService, BusinessRepositoryProvider],
  exports: [BusinessesService],
})
export class BusinessesModule {}
