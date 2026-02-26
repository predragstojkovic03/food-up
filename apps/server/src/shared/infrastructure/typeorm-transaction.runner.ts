import { Injectable } from '@nestjs/common';
import { ITransactionRunner } from '../application/transaction.runner';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TransactionContext } from './transaction-context';

@Injectable()
export class TypeOrmTransactionRunner implements ITransactionRunner {
  constructor(
    @InjectDataSource() private readonly _dataSource: DataSource,
    private readonly _transactionContext: TransactionContext,
  ) {}

  run<T>(work: () => Promise<T>): Promise<T> {
    return this._dataSource.transaction((manager) =>
      this._transactionContext.run(manager, work),
    );
  }
}
