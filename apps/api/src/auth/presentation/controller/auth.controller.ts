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
import { AuthenticationService } from '../../application/service/authentication.service';
import { PasswordRecoveryService } from '../../application/service/password-recovery.service';
import { TokenService } from '../../application/service/token.service';
import { AuthRegisterDto } from '../../domain/dto/auth-register.dto';
import { AuthForgetDto } from '../../domain/dto/auth-forget.dto';
import { AuthLoginDto } from '../../domain/dto/auth-login.dto';
import { AuthResetDto } from '../../domain/dto/auth-reset.dto';
import { SelectTenantDto } from '../../domain/dto/select-tenant.dto';
import { AuthGuard } from 'apps/api/src/common/guards/auth.guard';
import {
  ThrottleGuard,
  Throttle,
} from 'apps/api/src/common/guards/throttle.guard';
import { User } from 'apps/api/src/common/decorators/user.decorator';
import { Token } from 'apps/api/src/common/decorators/token-payload.decorator';
import { UserEntity } from 'apps/api/src/users/domain/entities/user.entity';
import { TokenPayload } from '../../application/service/token.service';
import { AppConfigService } from '@env-config/config.service';
import { UserPresenter } from '../presenter/user.presenter';
import { CookieService } from '../../application/service/cookie.service';
import { AuditService } from 'apps/api/src/common/services/audit.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthenticationService,
    private readonly passwordRecoveryService: PasswordRecoveryService,
    private readonly tokenService: TokenService,
    private readonly configService: AppConfigService,
    private readonly userPresenter: UserPresenter,
    private readonly cookieService: CookieService,
    private readonly auditService: AuditService
  ) {}

  @Post('login')
  @HttpCode(200)
  @UseGuards(ThrottleGuard)
  @Throttle({ limit: 5, ttl: 60000 })
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
        selectionToken: result.selectionToken,
      };
    }

    const res = req.res!;
    this.cookieService.setAccessTokenCookie(
      res,
      result.accessToken!,
      this.configService
    );

    await this.auditService.logLogin(
      result.user!.id,
      result.selectedTenant!.id
    );

    return {
      message: 'Login successful',
      tenant: result.selectedTenant,
    };
  }

  @Post('select-tenant')
  @HttpCode(200)
  @UseGuards(ThrottleGuard)
  @Throttle({ limit: 10, ttl: 60000 })
  @ApiOperation({
    summary: 'Select Tenant',
    description: 'Select a tenant after login when user has multiple tenants',
  })
  async selectTenant(
    @Body() selectTenantDto: SelectTenantDto,
    @Body('selectionToken') selectionToken: string,
    @Req() req: Request
  ) {
    const { accessToken } = await this.authService.selectTenant(
      selectionToken,
      selectTenantDto.tenantId
    );

    const res = req.res!;
    this.cookieService.setAccessTokenCookie(
      res,
      accessToken,
      this.configService
    );

    const tokenPayload = this.tokenService.verifyToken(accessToken);
    await this.auditService.logTenantSwitch(
      tokenPayload.sub,
      selectTenantDto.tenantId
    );

    return { message: 'Tenant selected successfully' };
  }

  @Post('register')
  @HttpCode(201)
  @UseGuards(ThrottleGuard)
  @Throttle({ limit: 3, ttl: 60000 })
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

    const tokenPayload = this.tokenService.verifyToken(accessToken);
    await this.auditService.logLogin(tokenPayload.sub, tokenPayload.tenantId);

    return { message: 'Registration successful' };
  }

  @Post('forget-password')
  @HttpCode(200)
  @UseGuards(ThrottleGuard)
  @Throttle({ limit: 3, ttl: 300000 })
  @ApiOperation({
    summary: 'Forget Password',
    description: 'Send a reset password email',
  })
  async forget(@Body() authForgetDto: AuthForgetDto) {
    await this.passwordRecoveryService.sendPasswordResetEmail(
      authForgetDto.email
    );
    return {
      message:
        'If an account exists with this email, a password reset link will be sent.',
    };
  }

  @Post('reset-password')
  @HttpCode(200)
  @UseGuards(ThrottleGuard)
  @Throttle({ limit: 5, ttl: 300000 })
  @ApiOperation({
    summary: 'Reset Password',
    description: 'Reset password with token',
  })
  async reset(@Body() authResetDto: AuthResetDto) {
    const { userId } = await this.passwordRecoveryService.resetPassword(
      authResetDto.token,
      authResetDto.password,
      authResetDto.confirmPassword
    );

    await this.auditService.logPasswordChange(userId);

    return { message: 'Password reset successfully' };
  }

  @UseGuards(AuthGuard)
  @Post('me')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get Current User',
    description: 'Get the current authenticated user',
  })
  async me(@User() user: UserEntity) {
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
      this.tokenService.verifyToken(token);
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
  async logout(@Res() res: Response, @Token() tokenPayload: TokenPayload) {
    this.cookieService.clearAccessTokenCookie(res, this.configService);

    await this.auditService.logLogout(tokenPayload.sub, tokenPayload.tenantId);

    return res.status(200).json({ message: 'Logout successful' });
  }
}
