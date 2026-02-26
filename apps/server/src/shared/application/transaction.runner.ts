export const I_TRANSACTION_RUNNER = Symbol('ITransactionRunner');

export interface ITransactionRunner {
  run<T>(work: () => Promise<T>): Promise<T>;
}
