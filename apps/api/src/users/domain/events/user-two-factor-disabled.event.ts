import { DomainEvent } from 'apps/api/src/shared/domain/events/domain-event.base';

export class UserTwoFactorDisabledEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string
  ) {
    super(userId, 'UserTwoFactorDisabledEvent');
  }
}
