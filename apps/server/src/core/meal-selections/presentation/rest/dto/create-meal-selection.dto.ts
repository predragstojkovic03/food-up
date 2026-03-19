import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateMealSelectionDto {
  @ApiProperty({ required: false, description: 'Omit to record a skip for this day' })
  @IsOptional()
  @IsString()
  menuItemId?: string;

  @ApiProperty()
  @IsString()
  mealSelectionWindowId: string;

  @ApiProperty({ description: 'ISO date string (YYYY-MM-DD) for the target day' })
  @IsDateString()
  date: string;

  @ApiProperty({ required: false })
  @IsOptional()
  quantity?: number;
}
