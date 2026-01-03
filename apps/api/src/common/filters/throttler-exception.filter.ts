import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { Response } from 'express';

@Catch(ThrottlerException)
export class ThrottlerExceptionFilter implements ExceptionFilter {
  catch(_exception: ThrottlerException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = HttpStatus.TOO_MANY_REQUESTS;

    const retryAfter = 60;

    response.setHeader('Retry-After', retryAfter);
    response.setHeader('X-RateLimit-Limit', '10');
    response.setHeader('X-RateLimit-Remaining', '0');
    response.setHeader(
      'X-RateLimit-Reset',
      new Date(Date.now() + retryAfter * 1000).toISOString()
    );

    response.status(status).json({
      statusCode: status,
      message:
        'Você excedeu o limite de requisições. Por favor, tente novamente mais tarde.',
      error: 'Too Many Requests',
      retryAfter: `${retryAfter}s`,
    });
  }
}
