import { MenuItem } from '../../domain/menu-item.entity';
import { IMenuItemsRepository } from '../../domain/menu-items.repository.interface';

export class FindAllMenuItemsUseCase {
  constructor(private readonly repository: IMenuItemsRepository) {}

  async execute(): Promise<MenuItem[]> {
    return this.repository.findAll();
  }
}
