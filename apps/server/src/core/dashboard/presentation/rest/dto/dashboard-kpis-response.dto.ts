import { Expose, Type } from 'class-transformer';

export class TopSupplierResponseDto {
  @Expose() name: string;
  @Expose() totalCost: number;
}

export class DashboardKpisResponseDto {
  @Expose() totalSpend: number;
  @Expose() totalSpendChange: number | null;
  @Expose() avgCostPerWindow: number;
  @Expose() avgCostPerWindowChange: number | null;

  @Expose()
  @Type(() => TopSupplierResponseDto)
  topSupplier: TopSupplierResponseDto | null;

  @Expose() totalChangeRequests: number;
  @Expose() totalChangeRequestsChange: number | null;
}
