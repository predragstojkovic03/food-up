import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

@Expose()
export class MealSelectionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  employeeId: string;

  @ApiProperty()
  menuItemId: string;

  @ApiProperty()
  mealSelectionWindowId: string;

  @ApiProperty()
  date: string;

  @ApiProperty({ required: false })
  quantity?: number | null;
}
