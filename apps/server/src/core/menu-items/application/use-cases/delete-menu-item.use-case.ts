import { IMenuItemsRepository } from '../../domain/menu-items.repository.interface';

export class DeleteMenuItemUseCase {
  constructor(private readonly repository: IMenuItemsRepository) {}

  async execute(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
