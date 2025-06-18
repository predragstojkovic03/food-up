import { Report } from '../../domain/report.entity';
import { IReportsRepository } from '../../domain/reports.repository.interface';

export class FindReportUseCase {
  constructor(private readonly repository: IReportsRepository) {}

  async execute(id: string): Promise<Report | null> {
    return this.repository.findOneByCriteria({ id });
  }
}
