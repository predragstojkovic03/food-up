import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { MealType } from 'src/core/meals/domain/meal.entity';

export class CreateMealDto {
  @ApiProperty({ example: 'Chicken Sandwich', description: 'Name of the meal' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Grilled chicken with lettuce',
    description: 'Description of the meal',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: MealType.Lunch,
    enum: MealType,
    description: 'Meal type',
  })
  @IsEnum(MealType)
  type: MealType;

  @ApiProperty({
    example: 9.99,
    description: 'Price of the meal',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiProperty({
    example: '12345678901234567890123456',
    description:
      'ID of the supplier providing the meal. It should be provided only for managed suppliers.',
    required: false,
  })
  @IsString()
  @IsOptional()
  supplierId?: string;
}
