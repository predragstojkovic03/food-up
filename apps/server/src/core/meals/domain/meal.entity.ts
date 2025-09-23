import { Entity } from 'src/shared/domain/entity';

export type MealType = 'breakfast' | 'lunch' | 'dinner';

export class Meal extends Entity {
  constructor(
    public readonly id: string,
    public name: string,
    public description: string,
    public type: MealType,
    public readonly supplierId: string,
    public price?: number,
  ) {
    super();
  }
}
