import { ulid } from 'ulid';
import { MenuPeriod } from '../../domain/menu-period.entity';
import { IMenuPeriodsRepository } from '../../domain/menu-periods.repository.interface';

export interface CreateMenuPeriodDto {
  startDate: Date;
  endDate: Date;
  supplierId: string;
}

export class CreateMenuPeriodUseCase {
  constructor(private readonly repository: IMenuPeriodsRepository) {}

  async execute(dto: CreateMenuPeriodDto): Promise<MenuPeriod> {
    const entity = new MenuPeriod(
      ulid(),
      dto.startDate,
      dto.endDate,
      dto.supplierId,
    );
    return this.repository.insert(entity);
  }
}
