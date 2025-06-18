import { IReportItemsRepository } from '../../domain/report-items.repository.interface';

export class DeleteReportItemUseCase {
  constructor(private readonly repository: IReportItemsRepository) {}

  async execute(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
