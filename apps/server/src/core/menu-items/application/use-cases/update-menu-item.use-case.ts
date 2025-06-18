import { MenuItem } from '../../domain/menu-item.entity';
import { IMenuItemsRepository } from '../../domain/menu-items.repository.interface';

export interface UpdateMenuItemDto {
  name?: string;
  description?: string;
  price?: number | null;
  menuPeriodId?: string;
  day?: Date;
  mealType?: 'breakfast' | 'lunch' | 'dinner';
}

export class UpdateMenuItemUseCase {
  constructor(private readonly repository: IMenuItemsRepository) {}

  async execute(id: string, dto: UpdateMenuItemDto): Promise<MenuItem> {
    const existing = await this.repository.findOneByCriteria({ id });
    if (!existing) throw new Error('MenuItem not found');
    const updated = new MenuItem(
      id,
      dto.name ?? existing.name,
      dto.description ?? existing.description,
      dto.price ?? existing.price,
      dto.menuPeriodId ?? existing.menuPeriodId,
      dto.day ?? existing.day,
      dto.mealType ?? existing.mealType,
    );
    return this.repository.update(id, updated);
  }
}
