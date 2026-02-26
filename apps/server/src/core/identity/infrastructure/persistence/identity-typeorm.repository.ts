import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { TransactionContext } from 'src/shared/infrastructure/transaction-context';
import { DataSource, Repository } from 'typeorm';
import { Identity } from '../../domain/identity.entity';
import { IIdentityRepository } from '../../domain/identity.repository.interface';
import { Identity as IdentityTypeormEntity } from './identity.typeorm-entity';

@Injectable()
export class IdentityTypeOrmRepository implements IIdentityRepository {
  constructor(
    @InjectDataSource() private readonly _dataSource: DataSource,
    private readonly _transactionContext: TransactionContext,
  ) {}

  private get _repo(): Repository<IdentityTypeormEntity> {
    const manager = this._transactionContext.getManager();
    return manager
      ? manager.getRepository(IdentityTypeormEntity)
      : this._dataSource.getRepository(IdentityTypeormEntity);
  }

  async findByEmail(email: string): Promise<Identity | null> {
    const entity = await this._repo.findOne({ where: { email } });
    return entity ? this.toDomain(entity) : null;
  }

  async findById(id: string): Promise<Identity | null> {
    const entity = await this._repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async create(identity: Identity): Promise<Identity> {
    const entity = this._repo.create(identity);
    const saved = await this._repo.save(entity);
    return this.toDomain(saved);
  }

  async update(id: string, update: Partial<Identity>): Promise<Identity> {
    await this._repo.update(id, update);
    const updated = await this._repo.findOne({ where: { id } });
    if (!updated) throw new Error('Identity not found');
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this._repo.delete(id);
  }

  private toDomain(entity: IdentityTypeormEntity): Identity {
    return new Identity(
      entity.id,
      entity.email,
      entity.passwordHash,
      entity.type,
      entity.isActive,
    );
  }
}
