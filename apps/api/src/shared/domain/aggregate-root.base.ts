import { DomainEvent } from './events/domain-event.base';

export abstract class AggregateRoot {
  private _domainEvents: DomainEvent[] = [];

  get domainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  public clearEvents(): void {
    this._domainEvents = [];
  }

  public pullDomainEvents(): DomainEvent[] {
    const events = this.domainEvents;
    this.clearEvents();
    return events;
  }
}
