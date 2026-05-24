import { EmployeeDaySelectionRow, OrderSummaryRow } from './dto/order-summary-row.dto';

export const I_ORDER_SUMMARY_QUERY_REPOSITORY = Symbol(
  'IOrderSummaryQueryRepository',
);

export type CostByWindowRow = {
  supplierId: string;
  supplierName: string;
  totalCost: number;
};

export interface IOrderSummaryQueryRepository {
  getByWindow(windowId: string): Promise<OrderSummaryRow[]>;
  getByWindowAndSupplier(
    windowId: string,
    supplierId: string,
  ): Promise<OrderSummaryRow[]>;
  getEmployeeSelections(windowId: string): Promise<EmployeeDaySelectionRow[]>;
  getCostByWindow(windowId: string): Promise<CostByWindowRow[]>;
}
