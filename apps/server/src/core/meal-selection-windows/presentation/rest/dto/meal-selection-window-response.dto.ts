import { ApiProperty } from '@nestjs/swagger';

export class MealSelectionWindowResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  menuPeriodId: string;

  @ApiProperty()
  startTime: Date;

  @ApiProperty()
  endTime: Date;

  @ApiProperty({ required: false })
  description?: string;
}
