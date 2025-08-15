import { FindMenuItemUseCase } from 'src/core/menu-items/application/use-cases/find-menu-item.use-case';
import { FindReportUseCase } from 'src/core/reports/application/use-cases/find-report.use-case';
import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
import { ReportItem } from '../../domain/report-item.entity';
import { IReportItemsRepository } from '../../domain/report-items.repository.interface';

export interface UpdateReportItemDto {
  reportId?: string;
  menuItemId?: string;
  date?: Date;
  quantity?: number;
}

export class UpdateReportItemUseCase {
  constructor(
    private readonly _repository: IReportItemsRepository,
    private readonly _findReportUseCase: FindReportUseCase,
    private readonly _findMenuItemUseCase: FindMenuItemUseCase,
  ) {}

  async execute(id: string, dto: UpdateReportItemDto): Promise<ReportItem> {
    const existing = await this._repository.findOneByCriteria({ id });
    if (!existing)
      throw new EntityInstanceNotFoundException('ReportItem not found');
    let reportIdToCheck = dto.reportId ?? existing.reportId;
    if (reportIdToCheck !== existing.reportId) {
      const report = await this._findReportUseCase.execute(reportIdToCheck);
      if (!report) {
        throw new EntityInstanceNotFoundException('Report not found');
      }
    }
    let menuItemIdToCheck = dto.menuItemId ?? existing.menuItemId;
    if (menuItemIdToCheck !== existing.menuItemId) {
      const menuItem =
        await this._findMenuItemUseCase.execute(menuItemIdToCheck);
      if (!menuItem) {
        throw new EntityInstanceNotFoundException('MenuItem not found');
      }
    }
    const updated = new ReportItem(
      id,
      reportIdToCheck,
      menuItemIdToCheck,
      dto.date ?? existing.date,
      dto.quantity ?? existing.quantity,
    );
    return this._repository.update(id, updated);
  }
}
