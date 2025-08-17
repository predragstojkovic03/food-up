import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuPeriodsService } from './application/menu-periods.service';
import { MenuPeriodsRepositoryProvider } from './infrastructure/menu-periods.providers';
import { MenuPeriod } from './infrastructure/persistence/menu-period.typeorm-entity';
import { MenuPeriodsController } from './presentation/rest/menu-periods.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MenuPeriod])],
  controllers: [MenuPeriodsController],
  providers: [MenuPeriodsRepositoryProvider, MenuPeriodsService],
  exports: [MenuPeriodsService],
})
export class MenuPeriodsModule {}
