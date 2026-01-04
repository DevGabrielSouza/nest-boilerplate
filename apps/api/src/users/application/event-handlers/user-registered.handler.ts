import { Injectable, OnModuleInit } from '@nestjs/common';
import { DomainEventDispatcher } from 'apps/api/src/shared/domain/events/domain-event-dispatcher';
import { UserRegisteredEvent } from '../../domain/events/user-registered.event';
import { RedisService } from 'apps/api/src/redis/redis.service';

@Injectable()
export class UserRegisteredHandler implements OnModuleInit {
  constructor(
    private readonly eventDispatcher: DomainEventDispatcher,
    private readonly redisService: RedisService
  ) {}

  onModuleInit() {
    this.eventDispatcher.register(
      'UserRegisteredEvent',
      this.handle.bind(this)
    );
  }

  async handle(event: UserRegisteredEvent): Promise<void> {
    console.log(
      `[UserRegisteredHandler] Handling event for user: ${event.email}`
    );

    this.redisService.redis.emit('CREATE_SEND_EMAIL', {
      name: event.name,
      email: event.email,
      subject: 'Bem-vindo à nossa plataforma',
      text: `Olá ${event.name}, bem-vindo à nossa plataforma!`,
    });
  }
}
