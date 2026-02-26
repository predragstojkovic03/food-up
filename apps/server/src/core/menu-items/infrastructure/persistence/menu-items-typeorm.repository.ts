import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { TransactionContext } from 'src/shared/infrastructure/transaction-context';
import { TypeOrmRepository } from 'src/shared/infrastructure/typeorm.repository';
import { DataSource, In } from 'typeorm';
import { MenuItem } from '../../domain/menu-item.entity';
import { IMenuItemsRepository } from '../../domain/menu-items.repository.interface';
import { MenuItemTypeOrmMapper } from './menu-item-typeorm.mapper';
import { MenuItem as MenuItemPersistence } from './menu-item.typeorm-entity';

@Injectable()
export class MenuItemsTypeOrmRepository
  extends TypeOrmRepository<MenuItem, MenuItemPersistence>
  implements IMenuItemsRepository
{
  constructor(
    @InjectDataSource() dataSource: DataSource,
    transactionContext: TransactionContext,
  ) {
    super(dataSource, MenuItemPersistence, new MenuItemTypeOrmMapper(), transactionContext);
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
