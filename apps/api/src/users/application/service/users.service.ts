import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../../domain/dto/create-user.dto';
import { UpdateUserDto } from '../../domain/dto/update-user.dto';
import { NotFoundError } from 'apps/api/src/common/errors/types/NotFoundError';
import { UserEntity } from '../../domain/entities/user.entity';
import { Password } from 'apps/api/src/shared/domain/value-objects/password';
import { UserDomainService } from '../../domain/services/user-domain.service';
import { CreateTenantDto } from 'apps/api/src/tenants/domain/dto/create-tenant.dto';
import { UsersRepository } from 'apps/api/src/users/infrastructure/database/users.repository';
import { RedisService } from 'apps/api/src/redis/redis.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly repository: UsersRepository,
    private readonly userDomainService: UserDomainService,
    private readonly redisService: RedisService
  ) {}

  async create(createUserDto: CreateUserDto) {
    const password = new Password({
      value: createUserDto.password,
      confirmValue: createUserDto.confirm_password,
    });
    const hashedPassword = await password.toHashed();

    const newUser = await this.repository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return newUser;
  }

  async createUserWithTenant(
    createUserDto: CreateUserDto,
    createTenantDto: CreateTenantDto
  ) {
    await this.userDomainService.ensureUserDoesNotExist(createUserDto.email);

    const { confirm_password, ...userDataWithoutConfirmPassword } =
      createUserDto;

    const password = new Password({
      value: createUserDto.password,
      confirmValue: confirm_password,
    });
    const hashedPassword = await password.toHashed();

    const newUser = await this.repository.createUserWithTenant(
      {
        ...userDataWithoutConfirmPassword,
        password: hashedPassword,
      },
      createTenantDto
    );

    this.redisService.redis.emit('CREATE_SEND_EMAIL', {
      name: createUserDto.name,
      email: createUserDto.email,
      subject: 'Welcome to our platform',
      text: 'Welcome to our platform',
    });

    return newUser;
  }

  async getUserByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.repository.findByEmail(email);

    if (!user) {
      return null;
    }

    return user;
  }

  async findOne(id: string): Promise<UserEntity | null> {
    const user = await this.repository.findOne(id);

    if (!user) {
      return null;
    }

    return user;
  }

  async findAll(): Promise<UserEntity[]> {
    const users = await this.repository.findAll();
    return users;
  }

  async findUserByIdAndTenantId(
    userId: string,
    tenantId: string
  ): Promise<UserEntity> {
    const user = await this.repository.findUserByIdAndTenantId(
      userId,
      tenantId
    );

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    const updatedUser = this.repository.update(id, updateUserDto);
    return updatedUser;
  }

  remove(id: string) {
    return this.repository.remove(id);
  }
}
