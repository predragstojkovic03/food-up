import { Inject, Injectable } from '@nestjs/common';
import { MenuPeriod } from '../domain/menu-period.entity';
import {
  I_MENU_PERIODS_REPOSITORY,
  IMenuPeriodsRepository,
} from '../domain/menu-periods.repository.interface';

@Injectable()
export class MenuPeriodsService {
  constructor(
    @Inject(I_MENU_PERIODS_REPOSITORY)
    private readonly repo: IMenuPeriodsRepository,
  ) {}

  async create(dto: any): Promise<MenuPeriod> {
    // Map DTO to entity
    const entity = new MenuPeriod(
      dto.id,
      dto.startDate,
      dto.endDate,
      dto.supplierId,
    );
    return this.repo.insert(entity);
  }

  async findAll(): Promise<MenuPeriod[]> {
    return this.repo.findAll();
  }

  async findOne(id: string): Promise<MenuPeriod | null> {
    return this.repo.findOneByCriteria({ id });
  }

  async update(id: string, dto: any): Promise<MenuPeriod> {
    // Map DTO to entity
    const entity = new MenuPeriod(
      id,
      dto.startDate,
      dto.endDate,
      dto.supplierId,
    );
    return this.repo.update(id, entity);
  }

  async delete(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}
