import { Injectable, OnModuleInit } from '@nestjs/common';
import { DomainEventDispatcher } from 'apps/api/src/shared/domain/events/domain-event-dispatcher';
import { UserTwoFactorEnabledEvent } from '../../domain/events/user-two-factor-enabled.event';
import { RedisService } from 'apps/api/src/redis/redis.service';

@Injectable()
export class UserTwoFactorEnabledHandler implements OnModuleInit {
  constructor(
    private readonly eventDispatcher: DomainEventDispatcher,
    private readonly redisService: RedisService
  ) {}

  onModuleInit() {
    this.eventDispatcher.register(
      'UserTwoFactorEnabledEvent',
      this.handle.bind(this)
    );
  }

  async handle(event: UserTwoFactorEnabledEvent): Promise<void> {
    console.log(
      `[UserTwoFactorEnabledHandler] 2FA enabled for user: ${event.email}`
    );

    this.redisService.redis.emit('CREATE_SEND_EMAIL', {
      email: event.email,
      subject: 'Autenticação de dois fatores ativada',
      text: 'A autenticação de dois fatores foi ativada em sua conta.',
    });
  }
}
