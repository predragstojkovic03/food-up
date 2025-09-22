import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateChangeRequestDto {
  @ApiProperty({
    example: 'meal-selection-uuid',
    description: 'Meal selection ID',
  })
  @IsString()
  mealSelectionId: string;

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
