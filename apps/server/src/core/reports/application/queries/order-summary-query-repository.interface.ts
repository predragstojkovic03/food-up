import {
  EmployeeDaySelectionRow,
  EmployeeWithoutSelectionRow,
  OrderSummaryRow,
} from './dto/order-summary-row.dto';

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
  /** Active employees of the window's business with no selection record (not even a skip) for a target date */
  getEmployeesWithoutSelection(windowId: string): Promise<EmployeeWithoutSelectionRow[]>;
  /** Employees whose selections for a target date were skipped or cleared by an approved change request */
  getSkippedEmployees(windowId: string): Promise<EmployeeWithoutSelectionRow[]>;
  getCostByWindow(windowId: string): Promise<CostByWindowRow[]>;
}
