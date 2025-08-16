import { Entity } from './entity';
import { Id } from './id.type';

export interface IRepository<T extends Entity<Id>> {
  findAll(): Promise<T[]>;
  insert(entity: T): Promise<T>;
  insertMany(entities: T[]): Promise<T[]>;
  delete(id: T['id']): Promise<void>;
  update(id: T['id'], entity: T): Promise<T>;
  exists(id: T['id']): Promise<boolean>;
  count(): Promise<number>;
  findByCriteria(criteria: Partial<T>): Promise<T[]>;
  findOneByCriteria(criteria: Partial<T>): Promise<T | null>;
  findBulkByIds(ids: T['id'][]): Promise<T[]>;
}
