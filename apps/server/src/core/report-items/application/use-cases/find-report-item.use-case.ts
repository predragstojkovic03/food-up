import { ReportItem } from '../../domain/report-item.entity';
import { IReportItemsRepository } from '../../domain/report-items.repository.interface';

export class FindReportItemUseCase {
  constructor(private readonly repository: IReportItemsRepository) {}

  async execute(id: string): Promise<ReportItem | null> {
    return this.repository.findOneByCriteria({ id });
  }
}
