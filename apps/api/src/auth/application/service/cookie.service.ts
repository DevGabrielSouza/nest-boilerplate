import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { AppConfigService } from '@env-config/config.service';

@Injectable()
export class CookieService {
  setAccessTokenCookie(
    res: Response,
    accessToken: string,
    config: AppConfigService
  ): void {
    const isProduction = config.nodeEnv === 'production';

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
      path: '/',
      ...(isProduction && {
        domain: config.domainName,
      }),
    });
  }

  clearAccessTokenCookie(res: Response, config: AppConfigService): void {
    const isProduction = config.nodeEnv === 'production';

    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      ...(isProduction && {
        domain: config.domainName,
      }),
    });
  }
}
