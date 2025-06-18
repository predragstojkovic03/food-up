import { IReportsRepository } from '../../domain/reports.repository.interface';

export class DeleteReportUseCase {
  constructor(private readonly repository: IReportsRepository) {}

  async execute(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
