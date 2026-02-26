import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { EntityManager } from 'typeorm';

@Injectable()
export class TransactionContext {
  private readonly _storage = new AsyncLocalStorage<EntityManager>();

  run<T>(manager: EntityManager, work: () => Promise<T>): Promise<T> {
    return this._storage.run(manager, work);
  }

  getManager(): EntityManager | undefined {
    return this._storage.getStore();
  }
}
