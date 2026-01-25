import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../../domain/dto/create-user.dto';
import { UpdateUserDto } from '../../domain/dto/update-user.dto';
import { NotFoundError } from 'apps/api/src/common/errors/types/NotFoundError';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserTenantEntity } from '../../domain/entities/user-tenant.entity';
import { Password } from 'apps/api/src/shared/domain/value-objects/password';
import { UserDomainService } from '../../domain/services/user-domain.service';
import { CreateTenantDto } from 'apps/api/src/tenants/domain/dto/create-tenant.dto';
import { UserRepository } from 'apps/api/src/users/domain/repositories/user.repository';
import { DomainEventDispatcher } from 'apps/api/src/shared/domain/events/domain-event-dispatcher';
import { runWithoutTenantFilter } from 'apps/api/src/prisma/middlewares/tenant-filter.middleware';
import { UserTenantPersistence } from '../../infrastructure/persistence';

@Injectable()
export class UsersService {
  constructor(
    private readonly repository: UserRepository,
    private readonly userDomainService: UserDomainService,
    private readonly eventDispatcher: DomainEventDispatcher
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

    const createdUser = await this.repository.createUserWithTenant(
      {
        ...userDataWithoutConfirmPassword,
        password: hashedPassword,
      },
      createTenantDto
    );

    const userAggregate = UserEntity.reconstitute(
      createdUser.userTenants[0].user
    );
    userAggregate.addToTenant(createdUser.id, createdUser.userTenants[0].role);
    await this.eventDispatcher.dispatchAll(userAggregate.pullDomainEvents());

    return createdUser;
  }

  async getUserByEmail(email: string): Promise<UserEntity | null> {
    const userData = await this.repository.findByEmail(email);

    if (!userData) {
      return null;
    }

    const userTenants = userData.userTenants?.map((ut: UserTenantPersistence) =>
      UserTenantEntity.reconstitute(ut)
    );

    return UserEntity.reconstitute({
      ...userData,
      userTenants,
    });
  }

  async findOne(id: string): Promise<UserEntity | null> {
    const userData = await runWithoutTenantFilter(async () => {
      return this.repository.findOne(id);
    });

    if (!userData) {
      return null;
    }

    const userTenants = userData.userTenants?.map((ut: UserTenantPersistence) =>
      UserTenantEntity.reconstitute(ut)
    );

    return UserEntity.reconstitute({
      ...userData,
      userTenants,
    });
  }

  async findAll(): Promise<UserEntity[]> {
    const usersData = await this.repository.findAll();
    return usersData.map((userData) => {
      const userTenants = userData.userTenants?.map(
        (ut: UserTenantPersistence) => UserTenantEntity.reconstitute(ut)
      );
      return UserEntity.reconstitute({
        ...userData,
        userTenants,
      });
    });
  }

  async findUserByIdAndTenantId(
    userId: string,
    tenantId: string
  ): Promise<UserEntity & { currentTenant: unknown; role: unknown }> {
    const userTenant = await this.repository.findUserByIdAndTenantId(
      userId,
      tenantId
    );

    if (!userTenant) {
      throw new NotFoundError('User not found in this tenant');
    }

    const userEntity = UserEntity.reconstitute(userTenant.user);

    return Object.assign(userEntity, {
      currentTenant: userTenant.tenant,
      role: userTenant.role,
    });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    const updatedUser = this.repository.update(id, updateUserDto);
    return updatedUser;
  }

  remove(id: string) {
    return this.repository.remove(id);
  }
}
