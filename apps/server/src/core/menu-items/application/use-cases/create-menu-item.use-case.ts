import { ulid } from 'ulid';
import { MenuItem } from '../../domain/menu-item.entity';
import { IMenuItemsRepository } from '../../domain/menu-items.repository.interface';

export interface CreateMenuItemDto {
  name: string;
  description: string;
  price?: number | null;
  menuPeriodId: string;
  day: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner';
}

export class CreateMenuItemUseCase {
  constructor(private readonly repository: IMenuItemsRepository) {}

  async execute(dto: CreateMenuItemDto): Promise<MenuItem> {
    const entity = new MenuItem(
      ulid(),
      dto.name,
      dto.description,
      dto.price ?? null,
      dto.menuPeriodId,
      dto.day,
      dto.mealType,
    );
    return this.repository.insert(entity);
  }
}
