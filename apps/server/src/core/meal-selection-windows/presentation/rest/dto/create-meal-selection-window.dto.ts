import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class CreateMealSelectionWindowDto {
  @ApiProperty()
  @IsString()
  menuPeriodId: string;

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

  @ApiProperty({ required: true })
  @IsString()
  businessId: string;
}
