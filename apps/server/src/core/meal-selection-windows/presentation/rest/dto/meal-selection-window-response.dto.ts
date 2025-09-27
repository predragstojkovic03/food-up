import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

@Expose()
export class MealSelectionWindowResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  menuPeriodIds: string[];

  @ApiProperty()
  startTime: Date;

  @ApiProperty()
  endTime: Date;

  @ApiProperty({ type: [String] })
  targetDates: string[];
}
