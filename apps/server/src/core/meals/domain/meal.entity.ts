export type MealType = 'breakfast' | 'lunch' | 'dinner';

export class Meal {
  constructor(
    public readonly id: string,
    public name: string,
    public description: string,
    public type: MealType,
    public price?: number,
  ) {}
}
