import { ulid } from 'ulid';
import { Report } from '../../domain/report.entity';
import { IReportsRepository } from '../../domain/reports.repository.interface';

export interface CreateReportDto {
  supplierId: string;
  mealSelectionWindowId: string;
  generatedAt: Date;
  type: 'full' | 'delta';
  isScheduled: boolean;
  scheduledFor?: Date | null;
}

export class CreateReportUseCase {
  constructor(private readonly repository: IReportsRepository) {}

  async execute(dto: CreateReportDto): Promise<Report> {
    const entity = new Report(
      ulid(),
      dto.supplierId,
      dto.mealSelectionWindowId,
      dto.generatedAt,
      dto.type,
      dto.isScheduled,
      dto.scheduledFor ?? null,
    );
    return this.repository.insert(entity);
  }
}
