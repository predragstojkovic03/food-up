import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  MenuItemsRepositoryProvide,
  MenuItemsUseCaseProviders,
} from './infrastructure/menu-items.providers';
import { MenuItem } from './infrastructure/persistence/menu-item.typeorm-entity';
import { MenuItemsController } from './presentation/rest/menu-items.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MenuItem])],
  controllers: [MenuItemsController],
  providers: [MenuItemsRepositoryProvide, ...MenuItemsUseCaseProviders],
})
export class MenuItemsModule {}
