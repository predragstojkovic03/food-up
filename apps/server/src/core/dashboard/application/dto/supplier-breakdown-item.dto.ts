export type SupplierCostDto = {
  supplierId: string;
  supplierName: string;
  cost: number;
};

export type SupplierBreakdownItemDto = {
  windowId: string;
  windowLabel: string;
  windowStart: string;
  suppliers: SupplierCostDto[];
};
