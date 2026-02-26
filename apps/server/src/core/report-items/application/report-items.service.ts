import { Inject, Injectable } from '@nestjs/common';
import { ReportItem } from '../domain/report-item.entity';
import {
  I_REPORT_ITEMS_REPOSITORY,
  IReportItemsRepository,
} from '../domain/report-items.repository.interface';

@Injectable()
export class ReportItemsService {
  constructor(
    @Inject(I_REPORT_ITEMS_REPOSITORY)
    private readonly _repository: IReportItemsRepository,
  ) {}

  async create(dto: any): Promise<ReportItem> {
    // Map DTO to entity
    const entity = new ReportItem(
      dto.id,
      dto.reportId,
      dto.menuItemId,
      dto.date,
      dto.quantity,
    );
    return this._repository.insert(entity);
  }

  async findAll(): Promise<ReportItem[]> {
    return this._repository.findAll();
  }

  async findOne(id: string): Promise<ReportItem | null> {
    return this._repository.findOneByCriteria({ id });
  }

  async update(id: string, dto: any): Promise<ReportItem> {
    // Map DTO to entity
    const entity = new ReportItem(
      id,
      dto.reportId,
      dto.menuItemId,
      dto.date,
      dto.quantity,
    );
    return this._repository.update(id, entity);
  }

  async delete(id: string): Promise<void> {
    return this._repository.delete(id);
  }
}
