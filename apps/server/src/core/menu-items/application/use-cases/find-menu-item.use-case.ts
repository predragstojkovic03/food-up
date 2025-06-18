import { MenuItem } from '../../domain/menu-item.entity';
import { IMenuItemsRepository } from '../../domain/menu-items.repository.interface';

export class FindMenuItemUseCase {
  constructor(private readonly repository: IMenuItemsRepository) {}

  async execute(id: string): Promise<MenuItem | null> {
    return this.repository.findOneByCriteria({ id });
  }
}
