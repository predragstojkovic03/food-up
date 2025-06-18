import { MenuPeriod } from '../../domain/menu-period.entity';
import { IMenuPeriodsRepository } from '../../domain/menu-periods.repository.interface';

export interface UpdateMenuPeriodDto {
  startDate?: Date;
  endDate?: Date;
  supplierId?: string;
}

export class UpdateMenuPeriodUseCase {
  constructor(private readonly repository: IMenuPeriodsRepository) {}

  async execute(id: string, dto: UpdateMenuPeriodDto): Promise<MenuPeriod> {
    const existing = await this.repository.findOneByCriteria({ id });
    if (!existing) throw new Error('MenuPeriod not found');
    const updated = new MenuPeriod(
      id,
      dto.startDate ?? existing.startDate,
      dto.endDate ?? existing.endDate,
      dto.supplierId ?? existing.supplierId,
    );
    return this.repository.update(id, updated);
  }
}
