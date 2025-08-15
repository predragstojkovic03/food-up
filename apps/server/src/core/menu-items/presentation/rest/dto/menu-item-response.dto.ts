import { ApiProperty } from '@nestjs/swagger';

export class MenuItemResponseDto {
  @ApiProperty({ example: 'menu-item-uuid', description: 'Menu item ID' })
  id: string;

  @ApiProperty({
    example: 'Chicken Sandwich',
    description: 'Name of the menu item',
  })
  name: string;

  @ApiProperty({
    example: 'Grilled chicken with lettuce',
    description: 'Description of the menu item',
  })
  description: string;

  @ApiProperty({
    example: 9.99,
    description: 'Price of the menu item',
    nullable: true,
  })
  price: number | null;

  @ApiProperty({ example: 'menu-period-uuid', description: 'Menu period ID' })
  menuPeriodId: string;

  @ApiProperty({
    example: '2025-08-15',
    description: 'Day for the menu item',
    type: String,
  })
  day: Date;

  @ApiProperty({
    example: 'lunch',
    enum: ['breakfast', 'lunch', 'dinner'],
    description: 'Meal type',
  })
  mealType: 'breakfast' | 'lunch' | 'dinner';
}
