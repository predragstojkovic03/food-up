import { Expose, Type } from 'class-transformer';

export class SupplierCostResponseDto {
  @Expose() supplierId: string;
  @Expose() supplierName: string;
  @Expose() cost: number;
}

export class SupplierBreakdownItemResponseDto {
  @Expose() windowId: string;
  @Expose() windowLabel: string;
  @Expose() windowStart: string;

  @Expose()
  @Type(() => SupplierCostResponseDto)
  suppliers: SupplierCostResponseDto[];
}
