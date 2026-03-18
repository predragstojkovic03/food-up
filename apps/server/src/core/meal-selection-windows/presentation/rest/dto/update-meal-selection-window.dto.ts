import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsDateString,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateMealSelectionWindowDto {
  @ApiPropertyOptional()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  menuPeriodIds?: string[];

  @ApiPropertyOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  @IsOptional()
  startTime?: Date;

  @ApiPropertyOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  @IsOptional()
  endTime?: Date;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsDateString({ strict: true }, { each: true })
  @Transform(({ value }) => value.map((date: string) => date.split('T')[0]))
  @IsOptional()
  targetDates?: string[];

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isLocked?: boolean;
}
