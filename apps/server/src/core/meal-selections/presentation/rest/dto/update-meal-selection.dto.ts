import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateMealSelectionDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  menuItemId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  mealSelectionWindowId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  quantity?: number;
}
