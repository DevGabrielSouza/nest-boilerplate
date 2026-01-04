import { DomainEvent } from 'apps/api/src/shared/domain/events/domain-event.base';

export class UserRegisteredEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly lastName: string,
    public readonly tenantId?: string
  ) {
    super(userId, 'UserRegisteredEvent');
  }
}
