import { DomainEvent } from 'apps/api/src/shared/domain/events/domain-event.base';
import { UserRole } from '@prisma/client';

export class UserAddedToTenantEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly tenantId: string,
    public readonly role: UserRole
  ) {
    super(userId, 'UserAddedToTenantEvent');
  }
}
