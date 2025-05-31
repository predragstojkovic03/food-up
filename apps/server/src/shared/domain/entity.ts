export abstract class Entity<T extends string | number | bigint = string> {
  public abstract readonly id: T;
}
