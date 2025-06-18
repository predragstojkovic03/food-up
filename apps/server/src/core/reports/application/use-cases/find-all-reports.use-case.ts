import { Report } from '../../domain/report.entity';
import { IReportsRepository } from '../../domain/reports.repository.interface';

export class FindAllReportsUseCase {
  constructor(private readonly repository: IReportsRepository) {}

  async execute(): Promise<Report[]> {
    return this.repository.findAll();
  }
}
