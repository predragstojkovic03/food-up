import { Module } from '@nestjs/common';
import { MenuItemsController } from './presentation/rest/menu-items.controller';

@Module({
  imports: [],
  controllers: [MenuItemsController],
  providers: [],
})
export class MenuItemsModule {}