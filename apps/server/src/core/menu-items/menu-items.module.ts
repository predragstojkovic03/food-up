import { Module } from '@nestjs/common';
import { MealsModule } from '../meals/meals.module';
import { MenuPeriodsModule } from '../menu-periods/menu-periods.module';
import { MenuItemsService } from './application/menu-items.service';
import { I_MENU_ITEMS_QUERY_REPOSITORY } from './application/queries/menu-items-query-repository.interface';
import { MenuItemsQueryService } from './application/queries/menu-items-query.service';
import { MenuItemsRepositoryProvide } from './infrastructure/menu-items.providers';
import { MenuItemsQueryTypeOrmRepository } from './infrastructure/persistence/menu-items-query-typeorm.repository';
import { MenuItemsController } from './presentation/rest/menu-items.controller';

@Module({
  imports: [MealsModule, MenuPeriodsModule],
  controllers: [MenuItemsController],
  providers: [
    MenuItemsRepositoryProvide,
    MenuItemsService,
    MenuItemsQueryService,
    {
      provide: I_MENU_ITEMS_QUERY_REPOSITORY,
      useClass: MenuItemsQueryTypeOrmRepository,
    },
  ],
  exports: [MenuItemsService],
})
export class MenuItemsModule {}
