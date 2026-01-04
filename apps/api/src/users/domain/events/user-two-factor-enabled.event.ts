import { DomainEvent } from 'apps/api/src/shared/domain/events/domain-event.base';

export class UserTwoFactorEnabledEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string
  ) {
    super(userId, 'UserTwoFactorEnabledEvent');
  }
}
