import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './application/service/oauth.service';
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { OAuthProvider } from './domain/types/oauth-provider.type';
import { UserRequest } from './domain/interfaces/user-request.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubLogin() {
    return null;
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubLoginCallback(@Req() req: UserRequest, @Res() res: Response) {
    await this.handleOAuthCallback('github', req, res);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {
    return null;
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleLoginCallback(@Req() req: UserRequest, @Res() res: Response) {
    await this.handleOAuthCallback('google', req, res);
  }

  @Post('exchange-code')
  async exchangeCode(@Body('code') code: string, @Res() res: Response) {
    const user = await this.authService.getUserByAuthCode(code);

    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired code' });
    }

    const token = await this.authService.generateJwt(user);
    await this.authService.deleteAuthCode(code);

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ success: true });
  }

  @Post('me')
  @UseGuards(AuthGuard('jwt'))
  async me(@Req() req: UserRequest) {
    return req.user;
  }

  private async handleOAuthCallback(
    provider: OAuthProvider,
    req: UserRequest,
    res: Response,
  ) {
    const code = uuidv4();
    const { user } = await this.authService.validateOAuthLogin(
      provider,
      req.user.id,
      req.user,
    );

    await this.authService.storeAuthCode(code, user);

    res.redirect(
      `${process.env.FRONTEND_URL}${process.env.FRONTEND_LOGIN_CALLBACK_ENDPOINT}/${code}`,
    );
  }
}