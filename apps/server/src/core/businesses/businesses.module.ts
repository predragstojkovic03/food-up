import { Module } from '@nestjs/common';
import { BusinessesService } from './application/businesses.service';
import { BusinessRepositoryProvider } from './infrastructure/business.providers';
import { BusinessesController } from './presentation/rest/businesses.controller';

@Module({
  controllers: [BusinessesController],
  providers: [BusinessesService, BusinessRepositoryProvider],
  exports: [BusinessesService],
})
export class BusinessesModule {}
