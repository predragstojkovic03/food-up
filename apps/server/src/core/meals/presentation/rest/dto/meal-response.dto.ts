import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { DietaryTag, MealType } from '@food-up/shared';

@Expose()
export class MealResponseDto {
  @Expose()
  @ApiProperty({ example: 'meal-uuid', description: 'Meal ID' })
  id: string;

  @Expose()
  @ApiProperty({ example: 'Chicken Sandwich', description: 'Name of the meal' })
  name: string;

  @Expose()
  @ApiProperty({
    example: 'Grilled chicken with lettuce',
    description: 'Description of the meal',
    required: false,
    nullable: true,
  })
  description?: string;

  @Expose()
  @ApiProperty({
    example: MealType.Lunch,
    enum: MealType,
    description: 'Meal type',
  })
  type: MealType;

  @Expose()
  @ApiProperty({
    example: 450.0,
    description: 'Price of the meal in RSD',
    required: false,
    nullable: true,
  })
  price?: number;

  @Expose()
  @ApiProperty({
    example: [DietaryTag.Vegetarian],
    enum: DietaryTag,
    isArray: true,
    description: 'Dietary labels',
  })
  dietaryTags: DietaryTag[];
}
