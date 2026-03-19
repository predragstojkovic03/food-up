import { IRelevantMealSelectionWindowResponse } from '@food-up/shared';
import { Expose } from 'class-transformer';

export class RelevantMealSelectionWindowResponseDto
  implements IRelevantMealSelectionWindowResponse
{
  @Expose() id: string;
  @Expose() startTime: string;
  @Expose() endTime: string;
  @Expose() targetDates: string[];
  @Expose() isActive: boolean;
}
