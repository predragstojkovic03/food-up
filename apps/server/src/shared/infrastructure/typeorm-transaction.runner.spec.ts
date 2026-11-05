import { TransactionContext } from './transaction-context';
import { TypeOrmTransactionRunner } from './typeorm-transaction.runner';

describe('TypeOrmTransactionRunner', () => {
  it('opens one transaction and lets nested runs join it', async () => {
    const context = new TransactionContext();
    const manager = { id: 'manager-1' };
    const dataSource = { transaction: jest.fn((work: (m: unknown) => Promise<unknown>) => work(manager)) };
    const runner = new TypeOrmTransactionRunner(dataSource as any, context);

    const seen = await runner.run(async () => {
      const outer = context.getManager();
      const inner = await runner.run(async () => context.getManager());
      return { outer, inner };
    });

    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(seen.outer).toBe(manager);
    expect(seen.inner).toBe(manager);
  });
});
