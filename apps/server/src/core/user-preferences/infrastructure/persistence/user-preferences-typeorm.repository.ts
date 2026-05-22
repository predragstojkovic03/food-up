import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { TransactionContext } from 'src/shared/infrastructure/transaction-context';
import { DataSource, Repository } from 'typeorm';
import { UserPreferences } from '../../domain/user-preferences.entity';
import { IUserPreferencesRepository } from '../../domain/user-preferences.repository.interface';
import { UserPreferencesTypeOrmEntity } from './user-preferences.typeorm-entity';

@Injectable()
export class UserPreferencesTypeOrmRepository implements IUserPreferencesRepository {
  constructor(
    @InjectDataSource() private readonly _dataSource: DataSource,
    private readonly _transactionContext: TransactionContext,
  ) {}

  private get _repo(): Repository<UserPreferencesTypeOrmEntity> {
    const manager = this._transactionContext.getManager();
    return manager
      ? manager.getRepository(UserPreferencesTypeOrmEntity)
      : this._dataSource.getRepository(UserPreferencesTypeOrmEntity);
  }

  async findByIdentityId(identityId: string): Promise<UserPreferences | null> {
    const entity = await this._repo.findOne({ where: { identityId } });
    return entity ? this.toDomain(entity) : null;
  }

  async create(prefs: UserPreferences): Promise<UserPreferences> {
    const entity = this._repo.create({
      id: prefs.id,
      identityId: prefs.identityId,
      theme: prefs.theme,
      language: prefs.language,
    });
    const saved = await this._repo.save(entity);
    return this.toDomain(saved);
  }

  async update(prefs: UserPreferences): Promise<UserPreferences> {
    await this._repo.update(
      { id: prefs.id },
      { theme: prefs.theme, language: prefs.language },
    );
    return prefs;
  }

  private toDomain(entity: UserPreferencesTypeOrmEntity): UserPreferences {
    return UserPreferences.reconstitute(
      entity.id,
      entity.identityId,
      entity.theme,
      entity.language,
    );
  }
}
