import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { IOrderSummarySendsRepository } from '../../domain/order-summary-sends.repository.interface';
import { OrderSummarySend as OrderSummarySendDomain } from '../../domain/order-summary-send.entity';
import { OrderSummarySend as OrderSummarySendPersistence } from './order-summary-send.typeorm-entity';
import { TransactionContext } from 'src/shared/infrastructure/transaction-context';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class OrderSummarySendsTypeOrmRepository
  implements IOrderSummarySendsRepository
{
  constructor(
    @InjectDataSource() private readonly _dataSource: DataSource,
    private readonly _transactionContext: TransactionContext,
  ) {}

  private get _repository(): Repository<OrderSummarySendPersistence> {
    const manager = this._transactionContext.getManager();
    return manager
      ? manager.getRepository(OrderSummarySendPersistence)
      : this._dataSource.getRepository(OrderSummarySendPersistence);
  }

  async insert(entity: OrderSummarySendDomain): Promise<void> {
    const persistence = new OrderSummarySendPersistence();
    persistence.id = entity.id;
    persistence.windowId = entity.windowId;
    persistence.supplierId = entity.supplierId;
    persistence.sentAt = entity.sentAt;
    persistence.sentByEmployeeId = entity.sentByEmployeeId;
    await this._repository.save(persistence);
  }

  async findLastByWindowAndSupplier(
    windowId: string,
    supplierId: string,
  ): Promise<OrderSummarySendDomain | null> {
    const record = await this._repository.findOne({
      where: { windowId, supplierId },
      order: { sentAt: 'DESC' },
    });

    if (!record) return null;

    return OrderSummarySendDomain.reconstitute(
      record.id,
      record.windowId,
      record.supplierId,
      record.sentAt,
      record.sentByEmployeeId,
    );
  }
}
