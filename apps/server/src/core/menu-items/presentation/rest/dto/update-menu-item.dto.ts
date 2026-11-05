import { IUpdateMenuItem } from '@food-up/shared/src/interfaces/menu-item';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateMenuItemDto implements IUpdateMenuItem {
  @ApiProperty({
    example: 9.99,
    description: 'Price of the menu item',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  price?: number | null;

  @ApiProperty({
    example: 'menu-period-uuid',
    description: 'Menu period ID',
    required: false,
  })
  @IsString()
  @IsOptional()
  menuPeriodId?: string;

  @ApiProperty({
    example: '2025-08-15',
    description: 'Day for the menu item',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => (typeof value === 'string' ? value.split('T')[0] : value))
  day?: string;

  @ApiProperty({
    example: 'meal-uuid',
    description: 'Meal ID',
    required: false,
  })
  @IsString()
  @IsOptional()
  mealId?: string;
}
