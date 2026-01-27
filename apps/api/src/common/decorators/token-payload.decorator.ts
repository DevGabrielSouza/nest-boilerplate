import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenPayload } from 'apps/api/src/auth/application/service/token.service';

export const Token = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TokenPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.tokenPayload;
  }
);
