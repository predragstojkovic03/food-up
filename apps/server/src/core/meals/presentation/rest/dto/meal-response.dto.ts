import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { MealType } from 'src/core/meals/domain/meal.entity';

@Expose()
export class MealResponseDto {
  @ApiProperty({ example: 'meal-uuid', description: 'Meal ID' })
  id: string;

  @ApiProperty({ example: 'Chicken Sandwich', description: 'Name of the meal' })
  name: string;

  @ApiProperty({
    example: 'Grilled chicken with lettuce',
    description: 'Description of the meal',
  })
  description: string;

  @ApiProperty({
    example: MealType.Lunch,
    enum: MealType,
    description: 'Meal type',
  })
  type: MealType;
}
