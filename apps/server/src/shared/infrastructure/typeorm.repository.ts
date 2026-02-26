import { InjectDataSource } from '@nestjs/typeorm';
import {
  DataSource,
  EntityTarget,
  FindOptionsWhere,
  In,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Entity } from '../domain/entity';
import { EntityInstanceNotFoundException } from '../domain/exceptions/entity-instance-not-found.exception';
import { Id } from '../domain/id.type';
import { IRepository } from '../domain/repository.interface';
import { TransactionContext } from './transaction-context';
import { TypeOrmMapper } from './typeorm.mapper';

type PersistenceEntity<T extends Entity<Id>> = QueryDeepPartialEntity<T>;

export abstract class TypeOrmRepository<T extends Entity>
  implements IRepository<T>
{
  constructor(
    @InjectDataSource() private readonly _dataSource: DataSource,
    private readonly _entityTarget: EntityTarget<ObjectLiteral>,
    protected readonly _mapper: TypeOrmMapper<T, PersistenceEntity<T>>,
    private readonly _transactionContext: TransactionContext,
  ) {}

  protected get _repository(): Repository<ObjectLiteral> {
    const manager = this._transactionContext.getManager();
    return manager
      ? manager.getRepository(this._entityTarget)
      : this._dataSource.getRepository(this._entityTarget);
  }

  async save(entity: T): Promise<T> {
    const mappedEntity = this._mapper.toPersistence(entity);
    await this._repository.save(mappedEntity);
    return entity;
  }

  async delete(id: Entity['id']): Promise<void> {
    await this._repository.delete({ id } as any);
  }

  async insert(entity: T): Promise<T> {
    const mappedEntity = this._mapper.toPersistence(entity);
    await this._repository.insert(mappedEntity);
    return entity;
  }

  async insertMany(entities: T[]): Promise<T[]> {
    const mappedEntities = entities.map((entity) =>
      this._mapper.toPersistence(entity),
    );
    await this._repository.insert(mappedEntities);
    return entities;
  }

  async update(id: Entity['id'], entity: T): Promise<T> {
    await this._repository.update(
      { id } as any,
      this._mapper.toPersistence(entity),
    );
    return entity;
  }

  exists(id: Entity['id']): Promise<boolean> {
    return this._repository.existsBy({ id } as any);
  }

  count(): Promise<number> {
    return this._repository.count();
  }

  findByCriteria(criteria: Partial<T>): Promise<T[]> {
    return this._repository
      .find({ where: this.buildWhere(criteria) })
      .then((entities) => {
        return entities.map((entity) => this._mapper.toDomain(entity as any));
      });
  }

  findOneByCriteria(criteria: Partial<T>): Promise<T | null> {
    return this._repository
      .findOne({ where: this.buildWhere(criteria) })
      .then((entity) => {
        return entity ? this._mapper.toDomain(entity as any) : null;
      });
  }

  findAll(): Promise<T[]> {
    return this._repository.find().then((entities) => {
      return entities.map((entity) => this._mapper.toDomain(entity as any));
    });
  }

  findBulkByIds(ids: T['id'][]): Promise<T[]> {
    return this._repository
      .find({
        where: { id: In(ids) } as FindOptionsWhere<T>,
      })
      .then((entities) => {
        return entities.map((entity) => this._mapper.toDomain(entity as any));
      });
  }

  async findOneByCriteriaOrThrow(criteria: Partial<T>): Promise<T> {
    const entity = await this.findOneByCriteria(criteria);

    if (!entity) {
      throw new EntityInstanceNotFoundException(
        `Instance of entity {${this._entityTarget}} not found`,
      );
    }

    return entity;
  }

  protected buildWhere(criteria: Partial<T>): FindOptionsWhere<any> {
    return this._mapper.toPersistencePartial(criteria) as FindOptionsWhere<any>;
  }
}
