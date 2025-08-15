import { FindMenuItemUseCase } from 'src/core/menu-items/application/use-cases/find-menu-item.use-case';
import { FindReportUseCase } from 'src/core/reports/application/use-cases/find-report.use-case';
import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
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
  constructor(
    private readonly _repository: IReportItemsRepository,
    private readonly _findReportUseCase: FindReportUseCase,
    private readonly _findMenuItemUseCase: FindMenuItemUseCase,
  ) {}

  async execute(dto: CreateReportItemDto): Promise<ReportItem> {
    const report = await this._findReportUseCase.execute(dto.reportId);
    if (!report) {
      throw new EntityInstanceNotFoundException('Report not found');
    }

    const menuItem = await this._findMenuItemUseCase.execute(dto.menuItemId);
    if (!menuItem) {
      throw new EntityInstanceNotFoundException('MenuItem not found');
    }

    const entity = new ReportItem(
      ulid(),
      dto.reportId,
      dto.menuItemId,
      dto.date,
      dto.quantity,
    );
    return this._repository.insert(entity);
  }
}
