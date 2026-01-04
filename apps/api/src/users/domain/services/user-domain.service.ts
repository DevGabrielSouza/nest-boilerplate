import { Injectable } from '@nestjs/common';
import { ConflictError } from 'apps/api/src/common/errors/types/ConflictError';
import { UserRepository } from 'apps/api/src/users/domain/repositories/user.repository';

@Injectable()
export class UserDomainService {
  constructor(private readonly repository: UserRepository) {}

  async ensureUserDoesNotExist(email: string): Promise<void> {
    const userAlreadyExists = await this.repository.findByEmail(email);
    if (userAlreadyExists) {
      throw new ConflictError(
        'Não foi possível completar o cadastro. Verifique os dados e tente novamente.'
      );
    }
  }
}
