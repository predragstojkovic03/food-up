import { FindSupplierUseCase } from 'src/core/suppliers/application/use-cases/find-supplier.use-case';
import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
import { ulid } from 'ulid';
import { Meal } from '../domain/meal.entity';
import { IMealsRepository } from '../domain/meals.repository.interface';

export class CreateMealUseCase {
  constructor(
    private readonly repository: IMealsRepository,
    private readonly _findSupplierUseCase: FindSupplierUseCase,
  ) {}

  async execute(meal: Omit<Meal, 'id'>): Promise<Meal> {
    const supplier = await this._findSupplierUseCase.execute(meal.supplierId);
    if (!supplier) {
      throw new EntityInstanceNotFoundException('Supplier not found');
    }

    const id = ulid();
    const newMeal = new Meal(
      id,
      meal.name,
      meal.description,
      meal.type,
      meal.supplierId,
    );

    return await this.repository.insert(newMeal);
  }
}
