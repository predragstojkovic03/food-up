import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

@Expose()
export class MealSelectionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  employeeId: string;

  @ApiProperty({ nullable: true })
  menuItemId: string | null;

  @ApiProperty()
  mealSelectionWindowId: string;

  @ApiProperty()
  date: string;

  @ApiProperty({ required: false, nullable: true })
  quantity?: number | null;
}
