import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmRepository } from 'src/shared/infrastructure/typeorm.repository';
import { Repository } from 'typeorm';
import { MenuItem } from '../../domain/menu-item.entity';
import { MenuItemTypeOrmMapper } from './menu-item-typeorm.mapper';
import { MenuItem as MenuItemPersistence } from './menu-item.typeorm-entity';

@Injectable()
export class MenuItemsTypeOrmRepository extends TypeOrmRepository<MenuItem> {
  constructor(
    @InjectRepository(MenuItemPersistence)
    repository: Repository<MenuItemPersistence>,
  ) {
    super(repository, new MenuItemTypeOrmMapper());
  }
}
