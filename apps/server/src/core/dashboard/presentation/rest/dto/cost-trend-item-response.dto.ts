import { Expose } from 'class-transformer';

export class CostTrendItemResponseDto {
  @Expose() period: string;
  @Expose() label: string;
  @Expose() totalCost: number;
}
