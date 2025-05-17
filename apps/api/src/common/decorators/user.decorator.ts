import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { NotFoundError } from '../errors/types/NotFoundError';

export const User = createParamDecorator(
  (data: string, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    if (!request.user) {
      throw new NotFoundError(
        'User not found. Try to use AuthGuard before this decorator.'
      );
    }

    return data ? request.user[data] : request.user;
  }
);
