export interface IExtraQuantity {
  id: string;
  windowId: string;
  menuItemId: string;
  quantity: number;
  guestName: string | null;
}

export interface IWindowCostSummary {
  supplierId: string;
  supplierName: string;
  totalCost: number;
}
