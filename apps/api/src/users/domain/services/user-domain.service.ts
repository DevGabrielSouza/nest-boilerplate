import { Injectable } from '@nestjs/common';
import { ConflictError } from 'apps/api/src/common/errors/types/ConflictError';
import { UsersRepository } from 'apps/api/src/users/infrastructure/database/users.repository';

@Injectable()
export class UserDomainService {
  constructor(private readonly repository: UsersRepository) {}

  async ensureUserDoesNotExist(email: string): Promise<void> {
    const userAlreadyExists = await this.repository.findByEmail(email);
    if (userAlreadyExists) {
      throw new ConflictError('User already exists');
    }
  }
}
