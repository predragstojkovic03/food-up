import { Entity } from 'src/shared/domain/entity';
import { generateId } from 'src/shared/domain/generate-id';
import { OrderSummarySentEvent } from './events/order-summary-sent.event';

export class OrderSummarySend extends Entity {
  static create(
    windowId: string,
    supplierId: string,
    sentByEmployeeId: string,
  ): OrderSummarySend {
    const entity = new OrderSummarySend(
      generateId(),
      windowId,
      supplierId,
      new Date(),
      sentByEmployeeId,
    );
    entity.addDomainEvent(
      new OrderSummarySentEvent(entity.id, windowId, supplierId),
    );
    return entity;
  }

  static reconstitute(
    id: string,
    windowId: string,
    supplierId: string,
    sentAt: Date,
    sentByEmployeeId: string,
  ): OrderSummarySend {
    return new OrderSummarySend(id, windowId, supplierId, sentAt, sentByEmployeeId);
  }

  private constructor(
    public readonly id: string,
    public readonly windowId: string,
    public readonly supplierId: string,
    public readonly sentAt: Date,
    public readonly sentByEmployeeId: string,
  ) {
    super();
  }
}
