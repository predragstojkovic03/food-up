import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmRepository } from 'src/shared/infrastructure/typeorm.repository';
import { In, Repository } from 'typeorm';
import { MenuItem } from '../../domain/menu-item.entity';
import { IMenuItemsRepository } from '../../domain/menu-items.repository.interface';
import { MenuItemTypeOrmMapper } from './menu-item-typeorm.mapper';
import { MenuItem as MenuItemPersistence } from './menu-item.typeorm-entity';

@Injectable()
export class MenuItemsTypeOrmRepository
  extends TypeOrmRepository<MenuItem>
  implements IMenuItemsRepository
{
  constructor(
    @InjectRepository(MenuItemPersistence)
    protected readonly _repository: Repository<MenuItemPersistence>,
  ) {
    super(_repository, new MenuItemTypeOrmMapper());
  }

  findBulkByMenuPeriodIdsWithMeal(
    menuPeriodIds: string[],
  ): Promise<MenuItem[]> {
    return this._repository
      .find({
        where: {
          menuPeriod: { id: In(menuPeriodIds) },
        },
      })
      .then((entities) =>
        entities.map((entity) => this._mapper.toDomain(entity)),
      );
  }
}
