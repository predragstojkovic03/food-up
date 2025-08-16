import { ApiProperty } from '@nestjs/swagger';

export class MealSelectionWindowResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  menuPeriodIds: string[];

  @ApiProperty()
  startTime: Date;

  @ApiProperty()
  endTime: Date;

  @ApiProperty({ required: false })
  description?: string;
}
