import {
  Controller,
  Post,
  Body,
  UseGuards,
  Res,
  Req,
  HttpCode,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Response } from 'express';
import { AuthService } from '../../application/service/auth.service';
import { AuthRegisterDto } from '../../domain/dto/auth-register.dto';
import { AuthForgetDto } from '../../domain/dto/auth-forget.dto';
import { AuthLoginDto } from '../../domain/dto/auth-login.dto';
import { AuthResetDto } from '../../domain/dto/auth-reset.dto';
import { AuthGuard } from 'apps/api/src/common/guards/auth.guard';
import { User } from 'apps/api/src/common/decorators/user.decorator';
import { AppConfigService } from '@env-config/config.service';
import { UserPresenter } from '../presenter/user.presenter';
import { CookieService } from '../../application/service/cookie.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: AppConfigService,
    private readonly userPresenter: UserPresenter,
    private readonly cookieService: CookieService
  ) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() authLoginDto: AuthLoginDto, @Req() req: Request) {
    const { accessToken } = await this.authService.login(authLoginDto);

    const res = req.res!;

    this.cookieService.setAccessTokenCookie(
      res,
      accessToken,
      this.configService
    );

    return { message: 'Login successful' };
  }

  @Post('register')
  register(@Body() authRegisterDto: AuthRegisterDto) {
    return this.authService.register(authRegisterDto);
  }

  @Post('forget-password')
  forget(@Body() authForgetDto: AuthForgetDto) {
    return this.authService.forget(authForgetDto);
  }

  @Post('reset-password')
  reset(@Body() authResetDto: AuthResetDto) {
    return this.authService.reset(authResetDto);
  }

  @UseGuards(AuthGuard)
  @Post('me')
  @HttpCode(200)
  async me(@User() user) {
    const currentUser = await this.authService.getCurrentUser(user);
    return this.userPresenter.present(currentUser);
  }

  @UseGuards(AuthGuard)
  @Post('validate')
  @HttpCode(200)
  async validate(@Req() req: Request) {
    const token = req.cookies?.accessToken;

    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }

    try {
      this.authService.checkToken(token);
      return { message: 'Token is valid' };
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    this.cookieService.clearAccessTokenCookie(res, this.configService);
    return res.status(200).json({ message: 'Logout successful' });
  }
}
