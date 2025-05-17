import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from '../dto/user-response.dto';

export class UserPresenter {
  present(user: unknown): UserResponseDto {
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }
}
