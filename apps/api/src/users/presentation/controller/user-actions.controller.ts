import {
  Controller,
  Patch,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from 'apps/api/src/common/guards/auth.guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRepository } from 'apps/api/src/users/domain/repositories/user.repository';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserTenantEntity } from '../../domain/entities/user-tenant.entity';
import { NotFoundError } from 'apps/api/src/common/errors/types/NotFoundError';
import { DomainEventDispatcher } from 'apps/api/src/shared/domain/events/domain-event-dispatcher';
import { UserTenant, Tenant } from '@prisma/client';

@ApiTags('User Actions')
@UseGuards(AuthGuard)
@Controller('users')
export class UserActionsController {
  constructor(
    private readonly repository: UserRepository,
    private readonly eventDispatcher: DomainEventDispatcher
  ) {}

  @Patch(':id/verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verifica o email do usuário' })
  @ApiResponse({ status: 200, description: 'Email verificado com sucesso' })
  async verifyEmail(@Param('id') id: string) {
    const userData = await this.repository.findOne(id);
    if (!userData) {
      throw new NotFoundError('Usuário não encontrado');
    }

    const userTenants = userData.userTenants?.map(
      (ut: UserTenant & { tenant?: Tenant }) =>
        UserTenantEntity.reconstitute(ut)
    );

    const user = UserEntity.reconstitute({
      ...userData,
      userTenants,
    });
    user.verifyEmail();

    await this.repository.update(id, {
      emailVerifiedAt: user.emailVerifiedAt ?? undefined,
    });

    await this.eventDispatcher.dispatchAll(user.pullDomainEvents());

    return {
      message: 'Email verificado com sucesso',
      user: {
        id: user.id,
        email: user.email,
        emailVerifiedAt: user.emailVerifiedAt,
      },
    };
  }

  @Patch(':id/enable-two-factor')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ativa autenticação de dois fatores' })
  @ApiResponse({ status: 200, description: '2FA ativado com sucesso' })
  async enableTwoFactor(@Param('id') id: string) {
    const userData = await this.repository.findOne(id);
    if (!userData) {
      throw new NotFoundError('Usuário não encontrado');
    }

    const userTenants = userData.userTenants?.map(
      (ut: UserTenant & { tenant?: Tenant }) =>
        UserTenantEntity.reconstitute(ut)
    );

    const user = UserEntity.reconstitute({
      ...userData,
      userTenants,
    });
    user.enableTwoFactor();

    await this.repository.update(id, {
      isTwoFactorEnabled: user.isTwoFactorEnabled,
    });

    await this.eventDispatcher.dispatchAll(user.pullDomainEvents());

    return {
      message: 'Autenticação de dois fatores ativada',
      user: {
        id: user.id,
        email: user.email,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
      },
    };
  }

  @Patch(':id/disable-two-factor')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desativa autenticação de dois fatores' })
  @ApiResponse({ status: 200, description: '2FA desativado com sucesso' })
  async disableTwoFactor(@Param('id') id: string) {
    const userData = await this.repository.findOne(id);
    if (!userData) {
      throw new NotFoundError('Usuário não encontrado');
    }

    const userTenants = userData.userTenants?.map(
      (ut: UserTenant & { tenant?: Tenant }) =>
        UserTenantEntity.reconstitute(ut)
    );

    const user = UserEntity.reconstitute({
      ...userData,
      userTenants,
    });
    user.disableTwoFactor();

    await this.repository.update(id, {
      isTwoFactorEnabled: user.isTwoFactorEnabled,
    });

    await this.eventDispatcher.dispatchAll(user.pullDomainEvents());

    return {
      message: 'Autenticação de dois fatores desativada',
      user: {
        id: user.id,
        email: user.email,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
      },
    };
  }
}
