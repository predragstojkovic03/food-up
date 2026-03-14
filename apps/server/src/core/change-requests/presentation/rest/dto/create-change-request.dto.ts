import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateChangeRequestDto {
  @ApiProperty({
    example: 'meal-selection-window-uuid',
    description: 'Meal selection window ID',
  })
  @IsString()
  mealSelectionWindowId: string;

  @ApiProperty({
    example: 'meal-selection-uuid',
    description: 'Meal selection ID. Omit if no prior selection was made (late selection request).',
    required: false,
  })
  @IsOptional()
  @IsString()
  mealSelectionId?: string;

  @ApiProperty({ example: 'menu-item-uuid', description: 'New menu item ID' })
  @IsOptional()
  @IsString()
  newMenuItemId?: string;

  @ApiProperty({
    example: 2,
    description: 'New quantity',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  newQuantity?: number;

  @ApiProperty({
    example: true,
    description: 'Whether to clear the current selection',
    required: false,
    nullable: true,
  })
  @IsBoolean()
  @IsOptional()
  clearSelection?: boolean;
}
