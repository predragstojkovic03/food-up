import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealsModule } from '../meals/meals.module';
import { MenuItemsService } from './application/menu-items.service';
import { I_MENU_ITEMS_QUERY_REPOSITORY } from './application/queries/menu-items-query-repository.interface';
import { MenuItemsQueryService } from './application/queries/menu-items-query.service';
import { MenuItemsRepositoryProvide } from './infrastructure/menu-items.providers';
import { MenuItem } from './infrastructure/persistence/menu-item.typeorm-entity';
import { MenuItemsQueryTypeOrmRepository } from './infrastructure/persistence/menu-items-query-typeorm.repository';
import { MenuItemsController } from './presentation/rest/menu-items.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MenuItem]), MealsModule],
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
  exports: [MenuItemsService, MenuItemsQueryService],
})
export class MenuItemsModule {}
