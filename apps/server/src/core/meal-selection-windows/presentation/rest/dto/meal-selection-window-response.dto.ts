import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IMealSelectionWindowResponse } from '@food-up/shared';

@Expose()
export class MealSelectionWindowResponseDto implements IMealSelectionWindowResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  menuPeriodIds: string[];

  @ApiProperty()
  startTime: string;

  @ApiProperty()
  endTime: string;

  @ApiProperty({ type: [String] })
  targetDates: string[];

  @ApiProperty()
  isLocked: boolean;

  @ApiProperty()
  notifyOnDeadline: boolean;
}
