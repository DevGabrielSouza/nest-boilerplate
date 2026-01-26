import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserDomainService } from '../../domain/services/user-domain.service';
import { DomainEventDispatcher } from 'apps/api/src/shared/domain/events/domain-event-dispatcher';
import { CreateUserDto } from '../../domain/dto/create-user.dto';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserRole } from '@prisma/client';

describe('UsersService', () => {
  let service: UsersService;
  let mockRepository: jest.Mocked<UserRepository>;
  let mockDomainService: jest.Mocked<UserDomainService>;
  let mockEventDispatcher: jest.Mocked<DomainEventDispatcher>;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findOne: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      createUserWithTenant: jest.fn(),
      findUserByIdAndTenantId: jest.fn(),
    };

    mockDomainService = {
      ensureUserDoesNotExist: jest.fn(),
    } as unknown as jest.Mocked<UserDomainService>;

    mockEventDispatcher = {
      register: jest.fn(),
      dispatch: jest.fn(),
      dispatchAll: jest.fn(),
      clearHandlers: jest.fn(),
      clearAllHandlers: jest.fn(),
    } as unknown as jest.Mocked<DomainEventDispatcher>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: mockRepository,
        },
        {
          provide: UserDomainService,
          useValue: mockDomainService,
        },
        {
          provide: DomainEventDispatcher,
          useValue: mockEventDispatcher,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        name: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        confirm_password: 'password123',
      };

      const mockUser = {
        id: 'user-id',
        name: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'hashed-password',
        taxId: null,
        image: null,
        emailVerifiedAt: null,
        isTwoFactorEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockResolvedValue(mockUser);

      // Act
      const result = await service.create(createUserDto);

      // Assert
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: expect.any(String), // Senha hasheada
        })
      );

      expect(result).toBeDefined();
      expect(result.id).toBe('user-id');
    });

    it('should throw error if password is too short', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        name: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: '123', // Muito curta
        confirm_password: '123',
      };

      // Act & Assert
      await expect(service.create(createUserDto)).rejects.toThrow();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error if passwords do not match', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        name: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        confirm_password: 'different', // Não confere
      };

      // Act & Assert
      await expect(service.create(createUserDto)).rejects.toThrow(
        'Passwords do not match'
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getUserByEmail', () => {
    it('should return user entity when found', async () => {
      // Arrange
      const email = 'john@example.com';
      const mockUserData = {
        id: 'user-id',
        name: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'hashed-password',
        taxId: null,
        image: null,
        emailVerifiedAt: new Date(),
        isTwoFactorEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        userTenants: [],
      };

      mockRepository.findByEmail.mockResolvedValue(mockUserData);

      // Act
      const result = await service.getUserByEmail(email);

      // Assert
      expect(mockRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toBeInstanceOf(UserEntity);
      expect(result?.email).toBe(email);
    });

    it('should return null when user not found', async () => {
      // Arrange
      const email = 'notfound@example.com';
      mockRepository.findByEmail.mockResolvedValue(null);

      // Act
      const result = await service.getUserByEmail(email);

      // Assert
      expect(mockRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return array of user entities', async () => {
      // Arrange
      const mockUsers = [
        {
          id: 'user-1',
          name: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'hashed',
          taxId: null,
          image: null,
          emailVerifiedAt: new Date(),
          isTwoFactorEnabled: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          userTenants: [],
        },
        {
          id: 'user-2',
          name: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          password: 'hashed',
          taxId: null,
          image: null,
          emailVerifiedAt: new Date(),
          isTwoFactorEnabled: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          userTenants: [],
        },
      ];

      mockRepository.findAll.mockResolvedValue(mockUsers);

      // Act
      const result = await service.findAll();

      // Assert
      expect(mockRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(UserEntity);
      expect(result[1]).toBeInstanceOf(UserEntity);
    });

    it('should return empty array when no users exist', async () => {
      // Arrange
      mockRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(mockRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('createUserWithTenant', () => {
    it('should create user with tenant and dispatch events', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        name: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        confirm_password: 'password123',
      };

      const createTenantDto = {
        name: "John's Workspace",
        slug: 'john-workspace',
      };

      const mockTenantWithUser = {
        id: 'tenant-id',
        name: "John's Workspace",
        slug: 'john-workspace',
        createdAt: new Date(),
        updatedAt: new Date(),
        userTenants: [
          {
            id: 'user-tenant-id',
            userId: 'user-id',
            tenantId: 'tenant-id',
            role: UserRole.TENANT,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            user: {
              id: 'user-id',
              name: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
              password: 'hashed',
              taxId: null,
              image: null,
              emailVerifiedAt: null,
              isTwoFactorEnabled: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        ],
      };

      mockDomainService.ensureUserDoesNotExist.mockResolvedValue(undefined);
      mockRepository.createUserWithTenant.mockResolvedValue(mockTenantWithUser);
      mockEventDispatcher.dispatchAll.mockResolvedValue(undefined);

      // Act
      const result = await service.createUserWithTenant(
        createUserDto,
        createTenantDto
      );

      // Assert
      expect(mockDomainService.ensureUserDoesNotExist).toHaveBeenCalledWith(
        'john@example.com'
      );
      expect(mockRepository.createUserWithTenant).toHaveBeenCalled();
      expect(mockEventDispatcher.dispatchAll).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.id).toBe('tenant-id');
    });

    it('should throw error if user already exists', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        name: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        confirm_password: 'password123',
      };

      const createTenantDto = {
        name: "John's Workspace",
        slug: 'john-workspace',
      };

      mockDomainService.ensureUserDoesNotExist.mockRejectedValue(
        new Error('User already exists')
      );

      // Act & Assert
      await expect(
        service.createUserWithTenant(createUserDto, createTenantDto)
      ).rejects.toThrow('User already exists');

      expect(mockRepository.createUserWithTenant).not.toHaveBeenCalled();
      expect(mockEventDispatcher.dispatchAll).not.toHaveBeenCalled();
    });
  });
});
