import { InjectDataSource } from '@nestjs/typeorm';
import {
  DataSource,
  EntityTarget,
  FindOptionsWhere,
  In,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import { Entity } from '../domain/entity';
import { EntityInstanceNotFoundException } from '../domain/exceptions/entity-instance-not-found.exception';
import { IRepository } from '../domain/repository.interface';
import { TransactionContext } from './transaction-context';
import { TypeOrmMapper } from './typeorm.mapper';

export abstract class TypeOrmRepository<
  TDomain extends Entity,
  TPersistence extends ObjectLiteral,
> implements IRepository<TDomain>
{
  constructor(
    @InjectDataSource() private readonly _dataSource: DataSource,
    private readonly _entityTarget: EntityTarget<TPersistence>,
    protected readonly _mapper: TypeOrmMapper<TDomain, TPersistence>,
    private readonly _transactionContext: TransactionContext,
  ) {}

  protected get _repository(): Repository<TPersistence> {
    const manager = this._transactionContext.getManager();
    return manager
      ? manager.getRepository(this._entityTarget)
      : this._dataSource.getRepository(this._entityTarget);
  }

  async save(entity: TDomain): Promise<TDomain> {
    const mappedEntity = this._mapper.toPersistence(entity);
    await this._repository.save(mappedEntity as any);
    return entity;
  }

  async delete(id: Entity['id']): Promise<void> {
    await this._repository.delete({ id } as unknown as FindOptionsWhere<TPersistence>);
  }

  async insert(entity: TDomain): Promise<TDomain> {
    const mappedEntity = this._mapper.toPersistence(entity);
    await this._repository.insert(mappedEntity as any);
    return entity;
  }

  async insertMany(entities: TDomain[]): Promise<TDomain[]> {
    const mappedEntities = entities.map((entity) =>
      this._mapper.toPersistence(entity),
    );
    await this._repository.insert(mappedEntities as any);
    return entities;
  }

  async update(id: Entity['id'], entity: TDomain): Promise<TDomain> {
    await this._repository.update(
      { id } as unknown as FindOptionsWhere<TPersistence>,
      this._mapper.toPersistence(entity) as any,
    );
    return entity;
  }

  exists(id: Entity['id']): Promise<boolean> {
    return this._repository.existsBy({ id } as unknown as FindOptionsWhere<TPersistence>);
  }

  count(): Promise<number> {
    return this._repository.count();
  }

  findByCriteria(criteria: Partial<TDomain>): Promise<TDomain[]> {
    return this._repository
      .find({ where: this.buildWhere(criteria) })
      .then((entities) => {
        return entities.map((entity) => this._mapper.toDomain(entity));
      });
  }

  findOneByCriteria(criteria: Partial<TDomain>): Promise<TDomain | null> {
    return this._repository
      .findOne({ where: this.buildWhere(criteria) })
      .then((entity) => {
        return entity ? this._mapper.toDomain(entity) : null;
      });
  }

  findAll(): Promise<TDomain[]> {
    return this._repository.find().then((entities) => {
      return entities.map((entity) => this._mapper.toDomain(entity));
    });
  }

  findBulkByIds(ids: TDomain['id'][]): Promise<TDomain[]> {
    return this._repository
      .find({
        where: { id: In(ids) } as unknown as FindOptionsWhere<TPersistence>,
      })
      .then((entities) => {
        return entities.map((entity) => this._mapper.toDomain(entity));
      });
  }

  async findOneByCriteriaOrThrow(criteria: Partial<TDomain>): Promise<TDomain> {
    const entity = await this.findOneByCriteria(criteria);

    if (!entity) {
      throw new EntityInstanceNotFoundException(
        `Instance of entity {${this._entityTarget}} not found`,
      );
    }

    return entity;
  }

  protected buildWhere(criteria: Partial<TDomain>): FindOptionsWhere<TPersistence> {
    return this._mapper.toPersistencePartial(criteria) as FindOptionsWhere<TPersistence>;
  }
}
