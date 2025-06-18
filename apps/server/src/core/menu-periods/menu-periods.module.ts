import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  MenuPeriodsRepositoryProvider,
  MenuPeriodsUseCaseProviders,
} from './infrastructure/menu-periods.providers';
import { MenuPeriod } from './infrastructure/persistence/menu-period.typeorm-entity';
import { MenuPeriodsController } from './presentation/rest/menu-periods.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MenuPeriod])],
  controllers: [MenuPeriodsController],
  providers: [MenuPeriodsRepositoryProvider, ...MenuPeriodsUseCaseProviders],
  exports: [MenuPeriodsRepositoryProvider, ...MenuPeriodsUseCaseProviders],
})
export class MenuPeriodsModule {}
