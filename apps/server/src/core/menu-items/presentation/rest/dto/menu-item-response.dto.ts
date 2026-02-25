import { IMenuItemResponse } from '@food-up/shared/src/interfaces/menu-item';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

@Expose()
export class MenuItemResponseDto implements IMenuItemResponse {
  @ApiProperty({ example: 'menu-item-uuid', description: 'Menu item ID' })
  id: string;

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
  day: string;

  @ApiProperty({ example: 'meal-uuid', description: 'Meal ID' })
  mealId: string;
}
