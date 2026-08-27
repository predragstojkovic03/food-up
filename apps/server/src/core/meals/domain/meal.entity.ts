import { DietaryTag, MealType } from '@food-up/shared';
import { Entity } from 'src/shared/domain/entity';
import { generateId } from 'src/shared/domain/generate-id';

export class Meal extends Entity {
  static create(
    name: string,
    description: string | undefined,
    type: MealType,
    supplierId: string,
    price?: number,
    dietaryTags: DietaryTag[] = [],
  ): Meal {
    return new Meal(generateId(), name, description, type, supplierId, price, dietaryTags);
  }

  static reconstitute(
    id: string,
    name: string,
    description: string | null | undefined,
    type: MealType,
    supplierId: string,
    price?: number,
    dietaryTags: DietaryTag[] = [],
  ): Meal {
    return new Meal(id, name, description ?? undefined, type, supplierId, price, dietaryTags);
  }

  private constructor(
    public readonly id: string,
    public name: string,
    public description: string | undefined,
    public type: MealType,
    public readonly supplierId: string,
    public price?: number,
    public dietaryTags: DietaryTag[] = [],
  ) {
    super();
  }
}
