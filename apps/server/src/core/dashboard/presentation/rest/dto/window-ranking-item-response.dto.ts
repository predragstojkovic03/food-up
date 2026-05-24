import { Expose } from 'class-transformer';

export class WindowRankingItemResponseDto {
  @Expose() windowId: string;
  @Expose() windowLabel: string;
  @Expose() startDate: string;
  @Expose() endDate: string;
  @Expose() supplierNames: string[];
  @Expose() totalCost: number;
}
