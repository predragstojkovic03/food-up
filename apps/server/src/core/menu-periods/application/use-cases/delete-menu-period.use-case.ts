import { IMenuPeriodsRepository } from '../../domain/menu-periods.repository.interface';

export class DeleteMenuPeriodUseCase {
  constructor(private readonly repository: IMenuPeriodsRepository) {}

  async execute(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
