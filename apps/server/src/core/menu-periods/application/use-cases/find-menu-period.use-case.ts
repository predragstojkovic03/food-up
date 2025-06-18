import { MenuPeriod } from '../../domain/menu-period.entity';
import { IMenuPeriodsRepository } from '../../domain/menu-periods.repository.interface';

export class FindMenuPeriodUseCase {
  constructor(private readonly repository: IMenuPeriodsRepository) {}

  async execute(id: string): Promise<MenuPeriod | null> {
    return this.repository.findOneByCriteria({ id });
  }
}
