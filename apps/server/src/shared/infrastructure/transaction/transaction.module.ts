import { Global, Module, Provider } from '@nestjs/common';
import { I_TRANSACTION_RUNNER } from 'src/shared/application/transaction.runner';
import { TransactionContext } from '../transaction-context';
import { TypeOrmTransactionRunner } from '../typeorm-transaction.runner';

const TransactionRunnerProvider: Provider = {
  provide: I_TRANSACTION_RUNNER,
  useClass: TypeOrmTransactionRunner,
};

@Global()
@Module({
  providers: [TransactionContext, TransactionRunnerProvider],
  exports: [TransactionContext, TransactionRunnerProvider],
})
export class TransactionModule {}
