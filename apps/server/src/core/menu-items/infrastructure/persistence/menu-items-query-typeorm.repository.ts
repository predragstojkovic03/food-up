import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IMenuItemsQueryRepository } from '../../application/queries/menu-items-query-repository.interface';
import { MenuItem } from './menu-item.typeorm-entity';

export class MenuItemsQueryTypeOrmRepository
  implements IMenuItemsQueryRepository
{
  constructor(
    @InjectRepository(MenuItem) private readonly repo: Repository<MenuItem>,
  ) {}

  async findWithMealsByMenuPeriodIds(
    menuPeriodIds: string[],
  ): Promise<MenuItemWithMealDto[]> {
    const menuItems = await this.repo
      .createQueryBuilder('menuItem')
      .leftJoinAndSelect('menuItem.meals', 'meal')
      .where('menuItem.menuPeriodId IN (:...menuPeriodIds)', { menuPeriodIds })
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
