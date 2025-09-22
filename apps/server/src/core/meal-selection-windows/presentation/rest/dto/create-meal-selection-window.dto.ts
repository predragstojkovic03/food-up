import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsOptional,
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

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
