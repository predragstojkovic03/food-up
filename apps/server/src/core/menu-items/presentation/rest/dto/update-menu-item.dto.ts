import { ApiProperty } from '@nestjs/swagger';

export class UpdateMenuItemDto {
  @ApiProperty({
    example: 9.99,
    description: 'Price of the menu item',
    required: false,
    nullable: true,
  })
  price?: number | null;

  @ApiProperty({
    example: 'menu-period-uuid',
    description: 'Menu period ID',
    required: false,
  })
  menuPeriodId?: string;

  @ApiProperty({
    example: '2025-08-15',
    description: 'Day for the menu item',
    type: String,
    required: false,
  })
  day?: Date;

  @ApiProperty({
    example: 'meal-uuid',
    description: 'Meal ID',
    required: false,
  })
  mealId?: string;
}
