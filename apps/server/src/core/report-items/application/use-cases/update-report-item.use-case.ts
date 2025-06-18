import { ReportItem } from '../../domain/report-item.entity';
import { IReportItemsRepository } from '../../domain/report-items.repository.interface';

export interface UpdateReportItemDto {
  reportId?: string;
  menuItemId?: string;
  date?: Date;
  quantity?: number;
}

export class UpdateReportItemUseCase {
  constructor(private readonly repository: IReportItemsRepository) {}

  async execute(id: string, dto: UpdateReportItemDto): Promise<ReportItem> {
    const existing = await this.repository.findOneByCriteria({ id });
    if (!existing) throw new Error('ReportItem not found');
    const updated = new ReportItem(
      id,
      dto.reportId ?? existing.reportId,
      dto.menuItemId ?? existing.menuItemId,
      dto.date ?? existing.date,
      dto.quantity ?? existing.quantity,
    );
    return this.repository.update(id, updated);
  }
}
