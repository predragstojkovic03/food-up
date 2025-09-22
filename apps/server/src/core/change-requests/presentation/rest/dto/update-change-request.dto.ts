import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateChangeRequestDto {
  @ApiProperty({
    example: 'meal-selection-ulid',
    description: 'Meal selection ID',
    required: false,
    nullable: false,
  })
  @IsOptional()
  @IsString()
  mealSelectionId: string;

  @ApiProperty({
    example: 'menu-item-ulid',
    description: 'New menu item ID',
    required: false,
    nullable: false,
  })
  @IsOptional()
  @IsString()
  newMenuItemId?: string;

  @ApiProperty({
    example: 2,
    description: 'New quantity',
    required: false,
    nullable: false,
  })
  @IsOptional()
  @IsNumber()
  newQuantity?: number;

  @ApiProperty({
    example: true,
    description: 'Whether to clear the current selection',
    required: false,
    nullable: false,
  })
  @IsOptional()
  @IsBoolean()
  clearSelection?: boolean;
}
