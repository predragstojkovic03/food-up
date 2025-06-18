import { MenuPeriod } from '../../domain/menu-period.entity';
import { IMenuPeriodsRepository } from '../../domain/menu-periods.repository.interface';

export class FindAllMenuPeriodsUseCase {
  constructor(private readonly repository: IMenuPeriodsRepository) {}

  async execute(): Promise<MenuPeriod[]> {
    return this.repository.findAll();
  }
}
