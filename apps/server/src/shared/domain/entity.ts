import { IEvent } from './event.interface';

export abstract class Entity<T extends string | number | bigint = string> {
  private readonly _domainEvents: IEvent[] = [];

  protected addDomainEvent(event: IEvent): void {
    this._domainEvents.push(event);
  }

  public pullDomainEvents(): IEvent[] {
    const events = [...this._domainEvents];
    this._domainEvents.length = 0;
    return events;
  }

  public abstract readonly id: T;
}
