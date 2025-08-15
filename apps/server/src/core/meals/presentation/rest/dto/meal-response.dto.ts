import { ApiProperty } from '@nestjs/swagger';

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
    example: 'lunch',
    enum: ['breakfast', 'lunch', 'dinner'],
    description: 'Meal type',
  })
  type: 'breakfast' | 'lunch' | 'dinner';
}
