import { ICreateMenuItem } from '@food-up/shared';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMenuItemDto implements ICreateMenuItem {
  @ApiProperty({
    example: 9.99,
    description: 'Price of the menu item',
    required: false,
    nullable: true,
  })
  @IsNumber()
  @IsOptional()
  price?: number | null;

  @ApiProperty({ example: 'menu-period-uuid', description: 'Menu period ID' })
  @IsString()
  menuPeriodId: string;

  @ApiProperty({
    example: '2025-08-15',
    description: 'Day for the menu item',
    type: String,
  })
  @IsDateString()
  @Transform(({ value }) => value.split('T')[0])
  day: string;

  @ApiProperty({ example: 'meal-uuid', description: 'Meal ID' })
  @IsString()
  mealId: string;
}
