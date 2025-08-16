import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateMealSelectionWindowDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  menuPeriodId?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  start?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  end?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;
}
