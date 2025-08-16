import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

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
    example: 'lunch',
    enum: ['breakfast', 'lunch', 'dinner'],
    description: 'Meal type',
  })
  @IsEnum(['breakfast', 'lunch', 'dinner'])
  type: 'breakfast' | 'lunch' | 'dinner';

  @ApiProperty({
    example: '12345678901234567890123456',
    description: 'ID of the supplier providing the meal',
  })
  @IsString()
  supplierId: string;
}
