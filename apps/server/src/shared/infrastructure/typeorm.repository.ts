import { FindOptionsWhere, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Entity } from '../domain/entity';
import { Id } from '../domain/id.type';
import { IRepository } from '../domain/repository.interface';
import { TypeOrmMapper } from './typeorm.mapper';

type PersistenceEntity<T extends Entity<Id>> = QueryDeepPartialEntity<T>;

export abstract class TypeOrmRepository<T extends Entity>
  implements IRepository<T>
{
  constructor(
    private readonly _repository: Repository<T>,
    private readonly _mapper: TypeOrmMapper<T, PersistenceEntity<T>>,
  ) {}

  async delete(id: Entity['id']): Promise<void> {
    await this._repository.delete({ id } as any);
  }

  async insert(entity: T): Promise<T> {
    const mappedEntity = this._mapper.toPersistence(entity);
    await this._repository.insert(mappedEntity);
    return entity;
  }

  async update(id: Entity['id'], entity: T): Promise<T> {
    await this._repository.update(
      { id } as any,
      this._mapper.toPersistence(entity),
    );
    return entity;
  }

  exists(id: Entity['id']): Promise<boolean> {
    return this._repository.exist({
      where: { id } as any,
    });
  }

  count(): Promise<number> {
    return this._repository.count();
  }

  findByCriteria(criteria: Partial<T>): Promise<T[]> {
    return this._repository.find({
      where: this._mapper.toPersistencePartial(
        criteria,
      ) as FindOptionsWhere<any>,
    });
  }

  findOneByCriteria(criteria: Partial<T>): Promise<T | null> {
    return this._repository.findOne({
      where: this._mapper.toPersistencePartial(
        criteria,
      ) as FindOptionsWhere<any>,
    });
  }

  findAll(): Promise<T[]> {
    return this._repository.find();
  }
}
