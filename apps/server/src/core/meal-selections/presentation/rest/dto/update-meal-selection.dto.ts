import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsOptional, IsString } from 'class-validator';

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString({ strict: true })
  @Transform(({ value }) => value.split('T')[0])
  date?: string;
}
