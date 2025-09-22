import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateMealSelectionWindowDto {
  @ApiPropertyOptional()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  menuPeriodIds?: string[];

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  start?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  end?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsDateString({ strict: true }, { each: true })
  @Transform(
    ({ value }) => new Set(value.map((date: string) => date.split('T')[0])),
  )
  @IsOptional()
  targetDates?: Set<string>;
}
