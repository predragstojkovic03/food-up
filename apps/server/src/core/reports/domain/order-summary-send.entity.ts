import { Entity } from 'src/shared/domain/entity';
import { generateId } from 'src/shared/domain/generate-id';
import { OrderSummarySentEvent } from './events/order-summary-sent.event';

export class OrderSummarySend extends Entity {
  static create(
    windowId: string,
    supplierId: string,
    sentByEmployeeId: string,
    subject: string,
    htmlContent: string,
  ): OrderSummarySend {
    const entity = new OrderSummarySend(
      generateId(),
      windowId,
      supplierId,
      new Date(),
      sentByEmployeeId,
      subject,
      htmlContent,
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
    subject: string,
    htmlContent: string,
  ): OrderSummarySend {
    return new OrderSummarySend(id, windowId, supplierId, sentAt, sentByEmployeeId, subject, htmlContent);
  }

  private constructor(
    public readonly id: string,
    public readonly windowId: string,
    public readonly supplierId: string,
    public readonly sentAt: Date,
    public readonly sentByEmployeeId: string,
    public readonly subject: string,
    public readonly htmlContent: string,
  ) {
    super();
  }
}
