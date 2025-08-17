import { Injectable } from '@nestjs/common';
import { MenuItem } from '../domain/menu-item.entity';
import { IMenuItemsRepository } from '../domain/menu-items.repository.interface';

@Injectable()
export class MenuItemsService {
  constructor(private readonly repo: IMenuItemsRepository) {}

  async create(dto: any): Promise<MenuItem> {
    // Map DTO to entity
    const entity = new MenuItem(
      dto.id,
      dto.price,
      dto.menuPeriodId,
      dto.day,
      dto.mealId,
    );
    return this.repo.insert(entity);
  }

  async findAll(): Promise<MenuItem[]> {
    return this.repo.findAll();
  }

  async findOne(id: string): Promise<MenuItem | null> {
    return this.repo.findOneByCriteria({ id });
  }

  async update(id: string, dto: any): Promise<MenuItem> {
    // Map DTO to entity
    const entity = new MenuItem(
      id,
      dto.price,
      dto.menuPeriodId,
      dto.day,
      dto.mealId,
    );
    return this.repo.update(id, entity);
  }

  async delete(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}
