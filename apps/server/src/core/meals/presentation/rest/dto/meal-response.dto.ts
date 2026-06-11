import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { MealType } from '@food-up/shared';

@Expose()
export class MealResponseDto {
  @ApiProperty({ example: 'meal-uuid', description: 'Meal ID' })
  id: string;

  @ApiProperty({ example: 'Chicken Sandwich', description: 'Name of the meal' })
  name: string;

  @ApiProperty({
    example: 'Grilled chicken with lettuce',
    description: 'Description of the meal',
    required: false,
    nullable: true,
  })
  description?: string;

  @ApiProperty({
    example: MealType.Lunch,
    enum: MealType,
    description: 'Meal type',
  })
  type: MealType;

  @ApiProperty({
    example: 450.0,
    description: 'Price of the meal in RSD',
    required: false,
    nullable: true,
  })
  price?: number;
}
