import { OrderSummarySend } from './order-summary-send.entity';

export const I_ORDER_SUMMARY_SENDS_REPOSITORY = Symbol(
  'IOrderSummarySendsRepository',
);

export interface IOrderSummarySendsRepository {
  insert(entity: OrderSummarySend): Promise<void>;
  findLastByWindowAndSupplier(
    windowId: string,
    supplierId: string,
  ): Promise<OrderSummarySend | null>;
}
