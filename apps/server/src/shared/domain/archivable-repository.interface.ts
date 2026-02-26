import { Entity } from './entity';
import { Id } from './id.type';
import { IRepository } from './repository.interface';

export interface IArchivableRepository<T extends Entity<Id>>
  extends IRepository<T> {
  archive(entity: T): Promise<void>;
  restore(entity: T): Promise<void>;
  findAllArchived(): Promise<T[]>;
}
