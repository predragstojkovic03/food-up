import { Injectable } from '@nestjs/common';
import { ReportItem } from '../domain/report-item.entity';
import { IReportItemsRepository } from '../domain/report-items.repository.interface';

@Injectable()
export class ReportItemsService {
  constructor(private readonly repo: IReportItemsRepository) {}

  async create(dto: any): Promise<ReportItem> {
    // Map DTO to entity
    const entity = new ReportItem(
      dto.id,
      dto.reportId,
      dto.menuItemId,
      dto.date,
      dto.quantity,
    );
    return this.repo.insert(entity);
  }

  async findAll(): Promise<ReportItem[]> {
    return this.repo.findAll();
  }

  async findOne(id: string): Promise<ReportItem | null> {
    return this.repo.findOneByCriteria({ id });
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
    return this.repo.update(id, entity);
  }

  async delete(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}
