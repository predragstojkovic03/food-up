import { IEvent } from 'src/shared/domain/event.interface';

export class OrderSummarySentEvent implements IEvent {
  name: string = 'reports.orderSummarySent';
  constructor(
    public readonly orderSummarySendId: string,
    public readonly windowId: string,
    public readonly supplierId: string,
  ) {}
}
