import { Entity } from 'src/shared/domain/entity';

export enum MealType {
  Breakfast = 'breakfast',
  Lunch = 'lunch',
  Dinner = 'dinner',
  Soup = 'soup',
  Salad = 'salad',
  Dessert = 'dessert',
}

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
