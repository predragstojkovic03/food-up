import { Inject, Injectable } from '@nestjs/common';
import { Report } from '../domain/report.entity';
import {
  I_REPORTS_REPOSITORY,
  IReportsRepository,
} from '../domain/reports.repository.interface';

@Injectable()
export class ReportsService {
  constructor(
    @Inject(I_REPORTS_REPOSITORY)
    private readonly _repository: IReportsRepository,
  ) {}

  async create(dto: any): Promise<Report> {
    // Map DTO to entity
    const entity = new Report(
      dto.id,
      dto.supplierId,
      dto.mealSelectionWindowId,
      dto.generatedAt,
      dto.type,
      dto.isScheduled,
      dto.scheduledFor,
    );
    return this._repository.insert(entity);
  }

  async findAll(): Promise<Report[]> {
    return this._repository.findAll();
  }

  async findOne(id: string): Promise<Report | null> {
    return this._repository.findOneByCriteria({ id });
  }

  async update(id: string, dto: any): Promise<Report> {
    // Map DTO to entity
    const entity = new Report(
      id,
      dto.supplierId,
      dto.mealSelectionWindowId,
      dto.generatedAt,
      dto.type,
      dto.isScheduled,
      dto.scheduledFor,
    );
    return this._repository.update(id, entity);
  }

  async delete(id: string): Promise<void> {
    return this._repository.delete(id);
  }
}
