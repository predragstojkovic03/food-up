import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateMealSelectionDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  menuItemId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  quantity?: number | null;
}
