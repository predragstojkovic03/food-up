import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BusinessRepositoryProvider,
  BusinessUseCases,
} from './infrastructure/business.providers';
import { Business } from './infrastructure/persistence/business.typeorm-entity';
import { BusinessesController } from './presentation/rest/businesses.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Business])],
  controllers: [BusinessesController],
  providers: [...BusinessUseCases, BusinessRepositoryProvider],
})
export class BusinessesModule {}
