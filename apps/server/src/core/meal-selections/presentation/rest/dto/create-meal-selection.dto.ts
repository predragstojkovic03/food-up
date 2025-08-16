import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

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
}
