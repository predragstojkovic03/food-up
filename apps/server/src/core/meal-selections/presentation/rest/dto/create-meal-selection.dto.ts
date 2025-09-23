import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateMealSelectionDto {
  @ApiProperty()
  @IsString()
  menuItemId: string;

  @ApiProperty()
  @IsString()
  mealSelectionWindowId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  quantity?: number;

  @ApiProperty()
  @IsDateString({ strict: true })
  @Transform(({ value }) => value.split('T')[0])
  date: string;
}
