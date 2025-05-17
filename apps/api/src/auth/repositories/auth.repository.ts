import { Injectable } from '@nestjs/common';
import { PrismaService } from 'apps/api/src/prisma/prisma.service';
import { AuthLoginDto } from '../domain/dto/auth-login.dto';
import { AuthRegisterDto } from '../domain/dto/auth-register.dto';
import { ConflictError } from 'apps/api/src/common/errors/types/ConflictError';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from 'apps/api/src/users/infrastructure/database/users.repository';
import { Password } from 'apps/api/src/shared/domain/value-objects/password';
import { NotFoundError } from '../../common/errors/types/NotFoundError';

@Injectable()
export class AuthRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersRepository: UsersRepository
  ) {}

  async login({ email, password }: AuthLoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const passwordVO = new Password({ value: password });
    const matchPassword = await passwordVO.matches(user.password);

    if (!user || !matchPassword) {
      throw new ConflictError('Email or password is incorrect');
    }

    return user;
  }

  async register(authRegisterDto: AuthRegisterDto) {
    try {
      const newUser = await this.usersRepository.create({
        ...authRegisterDto,
      });
      return newUser;
    } catch {
      throw new ConflictError('Error, please try again.');
    }
  }

  async comparePasswords(password: string, hashedPassword: string) {
    return bcrypt.compare(password, hashedPassword);
  }
}
