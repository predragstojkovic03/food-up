import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class CreateMealSelectionDto {
  @ApiProperty()
  @IsString()
  employeeId: string;

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
  @IsDate()
  date: Date;
}
