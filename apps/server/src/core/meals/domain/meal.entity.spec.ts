import { MealType } from '@food-up/shared';
import { Meal } from './meal.entity';

describe('Meal.create', () => {
  it('creates a meal with a description', () => {
    const meal = Meal.create('Chicken Sandwich', 'Grilled chicken with lettuce', MealType.Lunch, 'supplier-1');
    expect(meal.description).toBe('Grilled chicken with lettuce');
  });

  it('creates a meal without a description', () => {
    const meal = Meal.create('Chicken Sandwich', undefined, MealType.Lunch, 'supplier-1');
    expect(meal.description).toBeUndefined();
  });
});

describe('Meal.reconstitute', () => {
  it('reconstitutes a meal with a description', () => {
    const meal = Meal.reconstitute('id-1', 'Sandwich', 'A tasty sandwich', MealType.Lunch, 'supplier-1');
    expect(meal.description).toBe('A tasty sandwich');
  });

  it('reconstitutes a meal with null description from the database', () => {
    const meal = Meal.reconstitute('id-1', 'Sandwich', null as unknown as undefined, MealType.Lunch, 'supplier-1');
    expect(meal.description).toBeUndefined();
  });

  it('reconstitutes a meal without a description', () => {
    const meal = Meal.reconstitute('id-1', 'Sandwich', undefined, MealType.Lunch, 'supplier-1');
    expect(meal.description).toBeUndefined();
  });
});
