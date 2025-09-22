import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsDateString,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateMealSelectionWindowDto {
  @ApiProperty()
  @IsArray()
  @MinLength(1)
  @IsString({ each: true })
  menuPeriodIds: string[];

  @ApiProperty()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  startTime: Date;

  @ApiProperty()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  endTime: Date;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsDateString({ strict: true }, { each: true })
  @Transform(
    ({ value }) => new Set(value.map((date: string) => date.split('T')[0])),
  )
  targetDates: Set<string>;
}
