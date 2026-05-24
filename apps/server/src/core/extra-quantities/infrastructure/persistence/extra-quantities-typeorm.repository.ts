import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { TransactionContext } from 'src/shared/infrastructure/transaction-context';
import { DataSource, Repository } from 'typeorm';
import { ExtraQuantity as ExtraQuantityDomain } from '../../domain/extra-quantity.entity';
import { IExtraQuantitiesRepository } from '../../domain/extra-quantities.repository.interface';
import { ExtraQuantity as ExtraQuantityPersistence } from './extra-quantity.typeorm-entity';

@Injectable()
export class ExtraQuantitiesTypeOrmRepository implements IExtraQuantitiesRepository {
  constructor(
    @InjectDataSource() private readonly _dataSource: DataSource,
    private readonly _transactionContext: TransactionContext,
  ) {}

  private get _repository(): Repository<ExtraQuantityPersistence> {
    const manager = this._transactionContext.getManager();
    return manager
      ? manager.getRepository(ExtraQuantityPersistence)
      : this._dataSource.getRepository(ExtraQuantityPersistence);
  }

  async insert(entity: ExtraQuantityDomain): Promise<void> {
    const persistence = new ExtraQuantityPersistence();
    persistence.id = entity.id;
    persistence.windowId = entity.windowId;
    persistence.menuItemId = entity.menuItemId;
    persistence.quantity = entity.quantity;
    persistence.guestName = entity.guestName;
    await this._repository.save(persistence);
  }

  async findByWindow(windowId: string): Promise<ExtraQuantityDomain[]> {
    const records = await this._repository.find({ where: { windowId } });
    return records.map((r) =>
      ExtraQuantityDomain.reconstitute(r.id, r.windowId, r.menuItemId, r.quantity, r.guestName),
    );
  }

  async remove(id: string): Promise<void> {
    await this._repository.delete({ id });
  }
}
