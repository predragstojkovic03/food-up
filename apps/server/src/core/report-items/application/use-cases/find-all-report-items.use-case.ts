import { ReportItem } from '../../domain/report-item.entity';
import { IReportItemsRepository } from '../../domain/report-items.repository.interface';

export class FindAllReportItemsUseCase {
  constructor(private readonly repository: IReportItemsRepository) {}

  async execute(): Promise<ReportItem[]> {
    return this.repository.findAll();
  }
}
