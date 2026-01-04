import { DomainEvent } from 'apps/api/src/shared/domain/events/domain-event.base';

export class UserEmailVerifiedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly verifiedAt: Date
  ) {
    super(userId, 'UserEmailVerifiedEvent');
  }
}
