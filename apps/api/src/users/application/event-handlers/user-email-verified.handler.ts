import { Injectable, OnModuleInit } from '@nestjs/common';
import { DomainEventDispatcher } from 'apps/api/src/shared/domain/events/domain-event-dispatcher';
import { UserEmailVerifiedEvent } from '../../domain/events/user-email-verified.event';

@Injectable()
export class UserEmailVerifiedHandler implements OnModuleInit {
  constructor(private readonly eventDispatcher: DomainEventDispatcher) {}

  onModuleInit() {
    this.eventDispatcher.register(
      'UserEmailVerifiedEvent',
      this.handle.bind(this)
    );
  }

  async handle(event: UserEmailVerifiedEvent): Promise<void> {
    console.log(
      `[UserEmailVerifiedHandler] Email verified for user: ${event.email}`
    );
  }
}
