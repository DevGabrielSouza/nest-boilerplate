import { User, UserTenant, Tenant } from '@prisma/client';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { CreateTenantDto } from 'apps/api/src/tenants/domain/dto/create-tenant.dto';

/**
 * Tipos auxiliares para representar usuários com relações
 */
export type UserWithTenants = User & {
  userTenants?: (UserTenant & { tenant?: Tenant })[];
};

export type UserTenantWithRelations = UserTenant & {
  user: User;
  tenant: Tenant;
};

export type TenantWithUserTenants = Tenant & {
  userTenants: (UserTenant & { user: User })[];
};

/**
 * Interface do repositório de usuários
 * Define o contrato que qualquer implementação de persistência deve seguir
 *
 * Benefícios:
 * - Inversão de Dependência (SOLID)
 * - Facilita testes (mocking)
 * - Permite trocar implementação (PostgreSQL, MongoDB, etc.)
 * - Desacopla domínio da infraestrutura
 */
export abstract class UserRepository {
  /**
   * Cria um novo usuário
   * @param createUserDto - Dados do usuário a ser criado
   * @returns Usuário criado
   */
  abstract create(createUserDto: CreateUserDto): Promise<User>;

  /**
   * Cria um usuário com um tenant associado
   * @param createUserDto - Dados do usuário
   * @param createTenantDto - Dados do tenant
   * @returns Tenant criado com o usuário e relacionamento
   */
  abstract createUserWithTenant(
    createUserDto: Omit<CreateUserDto, 'confirm_password'>,
    createTenantDto: CreateTenantDto
  ): Promise<TenantWithUserTenants>;

  /**
   * Busca um usuário por email
   * @param email - Email do usuário
   * @returns Usuário encontrado com seus tenants ou null
   */
  abstract findByEmail(email: string): Promise<UserWithTenants | null>;

  /**
   * Busca um usuário por ID
   * @param id - ID do usuário
   * @returns Usuário encontrado com seus tenants ou null
   */
  abstract findOne(id: string): Promise<UserWithTenants | null>;

  /**
   * Busca usuário por ID e tenant ID
   * @param userId - ID do usuário
   * @param tenantId - ID do tenant
   * @returns Relacionamento UserTenant com dados do usuário e tenant
   */
  abstract findUserByIdAndTenantId(
    userId: string,
    tenantId: string
  ): Promise<UserTenantWithRelations | null>;

  /**
   * Lista todos os usuários
   * @returns Lista de usuários com seus tenants
   */
  abstract findAll(): Promise<UserWithTenants[]>;

  /**
   * Atualiza dados de um usuário
   * @param id - ID do usuário
   * @param updateUserDto - Dados a serem atualizados
   * @returns Usuário atualizado
   */
  abstract update(id: string, updateUserDto: UpdateUserDto): Promise<User>;

  /**
   * Remove um usuário
   * @param id - ID do usuário
   * @returns Usuário removido
   */
  abstract remove(id: string): Promise<User>;
}
