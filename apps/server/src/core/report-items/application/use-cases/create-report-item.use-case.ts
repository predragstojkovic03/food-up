import { ulid } from 'ulid';
import { ReportItem } from '../../domain/report-item.entity';
import { IReportItemsRepository } from '../../domain/report-items.repository.interface';

export interface CreateReportItemDto {
  reportId: string;
  menuItemId: string;
  date: Date;
  quantity: number;
}

export class CreateReportItemUseCase {
  constructor(private readonly repository: IReportItemsRepository) {}

  async execute(dto: CreateReportItemDto): Promise<ReportItem> {
    const entity = new ReportItem(
      ulid(),
      dto.reportId,
      dto.menuItemId,
      dto.date,
      dto.quantity,
    );
    return this.repository.insert(entity);
  }
}
