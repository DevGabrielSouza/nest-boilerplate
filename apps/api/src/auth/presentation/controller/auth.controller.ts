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
import { SelectTenantDto } from '../../domain/dto/select-tenant.dto';
import { AuthGuard } from 'apps/api/src/common/guards/auth.guard';
import { User } from 'apps/api/src/common/decorators/user.decorator';
import { AppConfigService } from '@env-config/config.service';
import { UserPresenter } from '../presenter/user.presenter';
import { CookieService } from '../../application/service/cookie.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
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
  @ApiOperation({
    summary: 'Login',
    description:
      'Login with email and password. May require tenant selection if user has multiple tenants.',
  })
  async login(@Body() authLoginDto: AuthLoginDto, @Req() req: Request) {
    const result = await this.authService.login(authLoginDto);

    if (result.requiresTenantSelection) {
      return {
        requiresTenantSelection: true,
        availableTenants: result.availableTenants,
        userId: result.user.id,
      };
    }

    const res = req.res!;
    this.cookieService.setAccessTokenCookie(
      res,
      result.accessToken,
      this.configService
    );

    return {
      message: 'Login successful',
      tenant: result.selectedTenant,
    };
  }

  @Post('select-tenant')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Select Tenant',
    description: 'Select a tenant after login when user has multiple tenants',
  })
  async selectTenant(
    @Body() selectTenantDto: SelectTenantDto,
    @Body('userId') userId: string,
    @Req() req: Request
  ) {
    const { accessToken } = await this.authService.selectTenant(
      userId,
      selectTenantDto.tenantId
    );

    const res = req.res!;
    this.cookieService.setAccessTokenCookie(
      res,
      accessToken,
      this.configService
    );

    return { message: 'Tenant selected successfully' };
  }

  @Post('register')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Register',
    description: 'Register a new user with a new tenant',
  })
  async register(
    @Body() authRegisterDto: AuthRegisterDto,
    @Req() req: Request
  ) {
    const { accessToken } = await this.authService.register(authRegisterDto);

    const res = req.res!;
    this.cookieService.setAccessTokenCookie(
      res,
      accessToken,
      this.configService
    );

    return { message: 'Registration successful' };
  }

  @Post('forget-password')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Forget Password',
    description: 'Send a reset password email',
  })
  forget(@Body() authForgetDto: AuthForgetDto) {
    return this.authService.forget(authForgetDto);
  }

  @Post('reset-password')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Reset Password',
    description: 'Reset password with token',
  })
  reset(@Body() authResetDto: AuthResetDto) {
    return this.authService.reset(authResetDto);
  }

  @UseGuards(AuthGuard)
  @Post('me')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get Current User',
    description: 'Get the current authenticated user',
  })
  async me(@User() user) {
    const currentUser = await this.authService.getCurrentUser(user);
    return this.userPresenter.present(currentUser);
  }

  @UseGuards(AuthGuard)
  @Post('validate')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Validate Token',
    description: 'Validate the access token',
  })
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

  @UseGuards(AuthGuard)
  @Post('logout')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Logout',
    description: 'Logout the user and clear the access token',
  })
  async logout(@Res() res: Response) {
    this.cookieService.clearAccessTokenCookie(res, this.configService);
    return res.status(200).json({ message: 'Logout successful' });
  }
}
