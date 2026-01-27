import { Injectable } from '@nestjs/common';
import { PrismaService } from 'apps/api/src/prisma/prisma.service';
import { AuthRegisterDto } from '../domain/dto/auth-register.dto';
import { ConflictError } from 'apps/api/src/common/errors/types/ConflictError';
import { UserRole } from '@prisma/client';
import { UserEntity } from 'apps/api/src/users/domain/entities/user.entity';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async register(authRegisterDto: AuthRegisterDto): Promise<{
    user: UserEntity;
    tenantId: string;
    role: UserRole;
  }> {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const createdTenant = await tx.tenant.create({
          data: {
            name: `${authRegisterDto.name}'s Workspace`,
            slug: `${authRegisterDto.email.split('@')[0]}-workspace`,
            userTenants: {
              create: {
                role: UserRole.TENANT,
                user: {
                  create: {
                    name: authRegisterDto.name,
                    lastName: authRegisterDto.lastName,
                    email: authRegisterDto.email,
                    password: authRegisterDto.password,
                    taxId: authRegisterDto.taxId,
                    image: authRegisterDto.image,
                    emailVerifiedAt: authRegisterDto.emailVerifiedAt,
                    isTwoFactorEnabled: false,
                  },
                },
              },
            },
          },
          include: {
            userTenants: {
              include: {
                user: true,
              },
            },
          },
        });

        return createdTenant;
      });

      const userTenant = result.userTenants[0];
      const user = UserEntity.reconstitute(userTenant.user);

      return {
        user,
        tenantId: result.id,
        role: UserRole.TENANT,
      };
    } catch (error) {
      throw new ConflictError(
        `Registration failed: ${(error as Error).message}`
      );
    }
  }
}
