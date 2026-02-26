import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { TransactionContext } from 'src/shared/infrastructure/transaction-context';
import { DataSource, Repository } from 'typeorm';
import { IMenuItemsQueryRepository } from '../../application/queries/menu-items-query-repository.interface';
import { MenuItem } from './menu-item.typeorm-entity';

@Injectable()
export class MenuItemsQueryTypeOrmRepository
  implements IMenuItemsQueryRepository
{
  constructor(
    @InjectDataSource() private readonly _dataSource: DataSource,
    private readonly _transactionContext: TransactionContext,
  ) {}

  private get _repository(): Repository<MenuItem> {
    const manager = this._transactionContext.getManager();
    return manager
      ? manager.getRepository(MenuItem)
      : this._dataSource.getRepository(MenuItem);
  }

  async findWithMealsByMenuPeriodIds(
    menuPeriodIds: string[],
  ): Promise<MenuItemWithMealDto[]> {
    const menuItems = await this._repository
      .createQueryBuilder('menuItem')
      .leftJoinAndSelect('menuItem.meal', 'meal')
      .leftJoin('menuItem.menuPeriod', 'menuPeriod')
      .where('menuPeriod.id IN (:...menuPeriodIds)', { menuPeriodIds })
      .getMany();

    return menuItems.map((menuItem) => ({
      id: menuItem.id,
      day: menuItem.day,
      price: menuItem.price ?? undefined,
      meal: {
        name: menuItem.meal.name,
        description: menuItem.meal.description,
      },
    }));
  }
}
