import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsDateString,
  IsString,
} from 'class-validator';

export class CreateMealSelectionWindowDto {
  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
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
  @Transform(({ value }) => value.map((date: string) => date.split('T')[0]))
  targetDates: string[];
}
