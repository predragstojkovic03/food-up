import { Entity } from 'src/shared/domain/entity';
import { generateId } from 'src/shared/domain/generate-id';

export enum MealType {
  Breakfast = 'breakfast',
  Lunch = 'lunch',
  Dinner = 'dinner',
  Soup = 'soup',
  Salad = 'salad',
  Dessert = 'dessert',
}

export class Meal extends Entity {
  static create(
    name: string,
    description: string,
    type: MealType,
    supplierId: string,
    price?: number,
  ): Meal {
    return new Meal(generateId(), name, description, type, supplierId, price);
  }

  static reconstitute(
    id: string,
    name: string,
    description: string,
    type: MealType,
    supplierId: string,
    price?: number,
  ): Meal {
    return new Meal(id, name, description, type, supplierId, price);
  }

  private constructor(
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
