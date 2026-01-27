import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '@env-config/config.service';
import { UserRepository } from 'apps/api/src/users/domain/repositories/user.repository';
import { NotFoundError } from 'apps/api/src/common/errors/types/NotFoundError';
import { Password } from 'apps/api/src/shared/domain/value-objects/password';
import { RedisService } from 'apps/api/src/redis/redis.service';
import { UnauthorizedError } from 'apps/api/src/common/errors/types/UnauthorizedError';

interface ResetTokenPayload {
  userId: string;
  email: string;
  type: 'password-reset';
}

@Injectable()
export class PasswordRecoveryService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: AppConfigService,
    private readonly userRepository: UserRepository,
    private readonly redisService: RedisService
  ) {}

  async sendPasswordResetEmail(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return;
    }

    const resetToken = await this.createResetToken(user.id, user.email);

    const resetUrl = `${this.configService.frontendUrl}/reset-password?token=${resetToken}`;

    this.redisService.redis.emit('CREATE_SEND_EMAIL', {
      name: user.name,
      email: user.email,
      subject: 'Recuperação de Senha',
      text: `Olá ${user.name}, clique no link para redefinir sua senha: ${resetUrl}`,
    });

    await this.redisService.redis.set(
      `password-reset:${user.id}`,
      resetToken,
      'EX',
      3600
    );
  }

  async resetPassword(
    token: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<{ userId: string }> {
    const payload = this.verifyResetToken(token);

    const storedToken = await this.redisService.redis.get(
      `password-reset:${payload.userId}`
    );

    if (!storedToken || storedToken !== token) {
      throw new UnauthorizedError('Invalid or expired reset token');
    }

    const user = await this.userRepository.findOne(payload.userId);

    if (!user || user.email !== payload.email) {
      throw new NotFoundError('User not found');
    }

    const password = new Password({
      value: newPassword,
      confirmValue: confirmPassword,
    });
    const hashedPassword = await password.toHashed();

    await this.userRepository.update(user.id, { password: hashedPassword });

    await this.redisService.redis.del(`password-reset:${payload.userId}`);

    return { userId: user.id };
  }

  private async createResetToken(
    userId: string,
    email: string
  ): Promise<string> {
    const secret = this.configService.jwtSecret;
    return this.jwtService.sign(
      {
        userId,
        email,
        type: 'password-reset',
      },
      {
        secret,
        expiresIn: '1h',
      }
    );
  }

  private verifyResetToken(token: string): ResetTokenPayload {
    try {
      const secret = this.configService.jwtSecret;
      const payload = this.jwtService.verify(token, {
        secret,
      }) as ResetTokenPayload;

      if (payload.type !== 'password-reset') {
        throw new UnauthorizedError('Invalid token type');
      }

      return payload;
    } catch (error) {
      throw new UnauthorizedError(
        `Invalid or expired reset token: ${(error as Error).message}`
      );
    }
  }
}
