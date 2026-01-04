export abstract class DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventName: string;
  public readonly aggregateId: string;

  constructor(aggregateId: string, eventName: string) {
    this.aggregateId = aggregateId;
    this.eventName = eventName;
    this.occurredOn = new Date();
  }
}
