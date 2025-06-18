import { Report } from '../../domain/report.entity';
import { IReportsRepository } from '../../domain/reports.repository.interface';

export interface UpdateReportDto {
  supplierId?: string;
  mealSelectionWindowId?: string;
  generatedAt?: Date;
  type?: 'full' | 'delta';
  isScheduled?: boolean;
  scheduledFor?: Date | null;
}

export class UpdateReportUseCase {
  constructor(private readonly repository: IReportsRepository) {}

  async execute(id: string, dto: UpdateReportDto): Promise<Report> {
    const existing = await this.repository.findOneByCriteria({ id });
    if (!existing) throw new Error('Report not found');
    const updated = new Report(
      id,
      dto.supplierId ?? existing.supplierId,
      dto.mealSelectionWindowId ?? existing.mealSelectionWindowId,
      dto.generatedAt ?? existing.generatedAt,
      dto.type ?? existing.type,
      dto.isScheduled ?? existing.isScheduled,
      dto.scheduledFor ?? existing.scheduledFor,
    );
    return this.repository.update(id, updated);
  }
}
