import { OrderSummaryRow } from './dto/order-summary-row.dto';

export const I_ORDER_SUMMARY_QUERY_REPOSITORY = Symbol(
  'IOrderSummaryQueryRepository',
);

export interface IOrderSummaryQueryRepository {
  getByWindow(windowId: string): Promise<OrderSummaryRow[]>;
  getByWindowAndSupplier(
    windowId: string,
    supplierId: string,
  ): Promise<OrderSummaryRow[]>;
}
