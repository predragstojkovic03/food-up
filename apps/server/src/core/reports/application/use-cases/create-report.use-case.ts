import { FindMealSelectionWindowUseCase } from 'src/core/meal-selection-windows/application/use-cases/find-meal-selection-window.use-case';
import { FindSupplierUseCase } from 'src/core/suppliers/application/use-cases/find-supplier.use-case';
import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
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
  constructor(
    private readonly _repository: IReportsRepository,
    private readonly _findSupplierUseCase: FindSupplierUseCase,
    private readonly _findMealSelectionWindowUseCase: FindMealSelectionWindowUseCase,
  ) {}

  async execute(dto: CreateReportDto): Promise<Report> {
    const supplier = await this._findSupplierUseCase.execute(dto.supplierId);
    if (!supplier) {
      throw new EntityInstanceNotFoundException('Supplier not found');
    }
    const mealSelectionWindow =
      await this._findMealSelectionWindowUseCase.execute(
        dto.mealSelectionWindowId,
      );
    if (!mealSelectionWindow) {
      throw new EntityInstanceNotFoundException(
        'MealSelectionWindow not found',
      );
    }
    const entity = new Report(
      ulid(),
      dto.supplierId,
      dto.mealSelectionWindowId,
      dto.generatedAt,
      dto.type,
      dto.isScheduled,
      dto.scheduledFor ?? null,
    );
    return this._repository.insert(entity);
  }
}
