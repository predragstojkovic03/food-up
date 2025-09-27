import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmRepository } from 'src/shared/infrastructure/typeorm.repository';
import { DeepPartial, In, Repository } from 'typeorm';
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

  override findOneByCriteria(
    criteria: Partial<MenuItem>,
  ): Promise<MenuItem | null> {
    const where = this.buildWhere(criteria);

    return super.findOneByCriteria(where);
  }

  override findByCriteria(criteria: Partial<MenuItem>): Promise<MenuItem[]> {
    const where = this.buildWhere(criteria);

    return super.findByCriteria(where);
  }

  override findOneByCriteriaOrThrow(
    criteria: Partial<MenuItem>,
  ): Promise<MenuItem> {
    const where = this.buildWhere(criteria);

    return super.findOneByCriteriaOrThrow(where);
  }

  private buildWhere(
    criteria: Partial<MenuItem>,
  ): DeepPartial<MenuItemPersistence> {
    const where: DeepPartial<MenuItemPersistence> = {};
    if (criteria.id) {
      where.id = criteria.id;
    }
    if (criteria.menuPeriodId) {
      where.menuPeriod = { id: criteria.menuPeriodId };
    }
    if (criteria.day) {
      where.day = criteria.day;
    }
    if (criteria.mealId) {
      where.meal = { id: criteria.mealId };
    }
    if (criteria.price !== undefined) {
      where.price = criteria.price;
    }
    return where;
  }
}
