import { FindMealSelectionWindowUseCase } from 'src/core/meal-selection-windows/application/use-cases/find-meal-selection-window.use-case';
import { FindSupplierUseCase } from 'src/core/suppliers/application/use-cases/find-supplier.use-case';
import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
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
  constructor(
    private readonly _repository: IReportsRepository,
    private readonly _findSupplierUseCase: FindSupplierUseCase,
    private readonly _findMealSelectionWindowUseCase: FindMealSelectionWindowUseCase,
  ) {}

  async execute(id: string, dto: UpdateReportDto): Promise<Report> {
    const existing = await this._repository.findOneByCriteria({ id });
    if (!existing)
      throw new EntityInstanceNotFoundException('Report not found');
    let supplierIdToCheck = dto.supplierId ?? existing.supplierId;
    if (supplierIdToCheck !== existing.supplierId) {
      const supplier =
        await this._findSupplierUseCase.execute(supplierIdToCheck);
      if (!supplier) {
        throw new EntityInstanceNotFoundException('Supplier not found');
      }
    }
    let mealSelectionWindowIdToCheck =
      dto.mealSelectionWindowId ?? existing.mealSelectionWindowId;
    if (mealSelectionWindowIdToCheck !== existing.mealSelectionWindowId) {
      const mealSelectionWindow =
        await this._findMealSelectionWindowUseCase.execute(
          mealSelectionWindowIdToCheck,
        );
      if (!mealSelectionWindow) {
        throw new EntityInstanceNotFoundException(
          'MealSelectionWindow not found',
        );
      }
    }
    const updated = new Report(
      id,
      supplierIdToCheck,
      mealSelectionWindowIdToCheck,
      dto.generatedAt ?? existing.generatedAt,
      dto.type ?? existing.type,
      dto.isScheduled ?? existing.isScheduled,
      dto.scheduledFor ?? existing.scheduledFor,
    );
    return this._repository.update(id, updated);
  }
}
