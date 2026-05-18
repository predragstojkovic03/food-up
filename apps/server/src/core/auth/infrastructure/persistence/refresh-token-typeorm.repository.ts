import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  IRefreshTokenRepository,
  RefreshTokenRecord,
} from 'src/core/auth/domain/refresh-token.repository.interface';
import { TransactionContext } from 'src/shared/infrastructure/transaction-context';
import { DataSource, Repository } from 'typeorm';
import { RefreshTokenTypeOrmEntity } from './refresh-token.typeorm-entity';

@Injectable()
export class RefreshTokenTypeOrmRepository implements IRefreshTokenRepository {
  constructor(
    @InjectDataSource() private readonly _dataSource: DataSource,
    private readonly _transactionContext: TransactionContext,
  ) {}

  private get _repo(): Repository<RefreshTokenTypeOrmEntity> {
    const manager = this._transactionContext.getManager();
    return manager
      ? manager.getRepository(RefreshTokenTypeOrmEntity)
      : this._dataSource.getRepository(RefreshTokenTypeOrmEntity);
  }

  async create(token: RefreshTokenRecord): Promise<void> {
    await this._repo.save(this._repo.create(token));
  }

  async findById(id: string): Promise<RefreshTokenRecord | null> {
    return this._repo.findOne({ where: { id } });
  }

  async markUsed(id: string, usedAt: Date): Promise<void> {
    await this._repo.update(id, { usedAt });
  }

  async revokeFamily(familyId: string): Promise<void> {
    await this._repo.update({ familyId }, { isRevoked: true });
  }

  async revoke(id: string): Promise<void> {
    await this._repo.update(id, { isRevoked: true });
  }
}
