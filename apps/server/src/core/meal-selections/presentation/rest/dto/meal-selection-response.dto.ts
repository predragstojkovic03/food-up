import { ApiProperty } from '@nestjs/swagger';

export class MealSelectionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  employeeId: string;

  @ApiProperty()
  menuItemId: string;

  @ApiProperty()
  mealSelectionWindowId: string;

  @ApiProperty({ required: false })
  quantity?: number | null;
}
