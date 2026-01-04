import { Injectable, OnModuleInit } from '@nestjs/common';
import { DomainEventDispatcher } from 'apps/api/src/shared/domain/events/domain-event-dispatcher';
import { UserAddedToTenantEvent } from '../../domain/events/user-added-to-tenant.event';

@Injectable()
export class UserAddedToTenantHandler implements OnModuleInit {
  constructor(private readonly eventDispatcher: DomainEventDispatcher) {}

  onModuleInit() {
    this.eventDispatcher.register(
      'UserAddedToTenantEvent',
      this.handle.bind(this)
    );
  }

  async handle(event: UserAddedToTenantEvent): Promise<void> {
    console.log(
      `[UserAddedToTenantHandler] User ${event.userId} added to tenant ${event.tenantId} with role ${event.role}`
    );
  }
}
