import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { CookieOptions, Request, Response } from 'express';
import { EmployeesService } from 'src/core/employees/application/employees.service';
import { EnvironmentVariables, NodeEnv } from 'src/env.validation';
import {
  I_CONFIG_SERVICE,
  IConfigService,
} from 'src/shared/application/config-service.interface';
import { IdentityType } from '@food-up/shared';
import { AuthService } from '../../application/auth.service';
import { CurrentIdentity } from '../../infrastructure/current-identity.decorator';
import { JwtPayload } from '../../infrastructure/jwt-payload';
import { LocalAuthGuard } from '../../infrastructure/local-auth.guard';
import { Public } from '../../infrastructure/public.decorator';
import { AuthResponseDto } from './dto/auth-response.dto';
import { MeResponseDto } from './dto/me-response.dto';

const REFRESH_COOKIE_NAME = 'refresh_token';

/**
 * WHY a helper function instead of a constant: `secure` depends on NODE_ENV,
 * which we resolve at runtime from the env, so we build options per-response.
 */
function refreshCookieOptions(isProduction: boolean): CookieOptions {
  return {
    httpOnly: true,      // JS cannot read this cookie — XSS can't steal the refresh token
    secure: isProduction, // Only sent over HTTPS in production
    sameSite: 'strict',  // Never sent by cross-site requests — CSRF protection
    path: '/api/auth',   // Browser only attaches the cookie on /api/auth/* requests
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly _isProduction: boolean;

  constructor(
    private readonly _authService: AuthService,
    private readonly _employeesService: EmployeesService,
    @Inject(I_CONFIG_SERVICE)
    config: IConfigService<EnvironmentVariables, true>,
  ) {
    this._isProduction = config.get('NODE_ENV') === NodeEnv.Production;
  }

  /**
   * Validates credentials via LocalAuthGuard (Passport local strategy).
   * On success, Passport sets req.user = Identity.
   *
   * WHY @UseGuards(LocalAuthGuard) instead of manual validation:
   * Using the Passport strategy pattern makes login extensible. Adding Google OAuth
   * means adding @UseGuards(GoogleAuthGuard) on a new endpoint — no other code changes.
   * All strategies resolve to an Identity, then issueSessionForIdentity() handles the rest.
   */
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Access token returned, refresh token set as httpOnly cookie', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @Public
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const identity = req.user as { id: string };
    const { accessToken, rawRefreshToken } = await this._authService.issueSessionForIdentity(identity.id);

    res.cookie(REFRESH_COOKIE_NAME, rawRefreshToken, refreshCookieOptions(this._isProduction));

    return plainToInstance(AuthResponseDto, { access_token: accessToken });
  }

  /**
   * Reads the httpOnly refresh cookie, validates it, rotates to a new refresh token,
   * and returns a new access token. The old refresh token is consumed (marked usedAt).
   *
   * WHY @Public: the caller may not have a valid access token (that's why they're refreshing).
   * Authentication here is the refresh cookie itself, not the Authorization header.
   */
  @ApiOperation({ summary: 'Rotate refresh token and get a new access token' })
  @ApiCookieAuth(REFRESH_COOKIE_NAME)
  @ApiResponse({ status: 200, description: 'New access token returned, new refresh cookie set', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Refresh token invalid, expired, or revoked' })
  @Public
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const rawToken: string | undefined = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!rawToken) throw new UnauthorizedException('No refresh token');
    const { accessToken, rawRefreshToken } = await this._authService.refreshSession(rawToken);

    res.cookie(REFRESH_COOKIE_NAME, rawRefreshToken, refreshCookieOptions(this._isProduction));

    return plainToInstance(AuthResponseDto, { access_token: accessToken });
  }

  /**
   * Revokes the current refresh token and clears the cookie.
   * Idempotent: safe to call even if already logged out.
   */
  @ApiOperation({ summary: 'Logout — revoke refresh token and clear cookie' })
  @ApiCookieAuth(REFRESH_COOKIE_NAME)
  @ApiResponse({ status: 204, description: 'Logged out' })
  @Public
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const rawToken: string | undefined = req.cookies?.[REFRESH_COOKIE_NAME];
    await this._authService.revokeSession(rawToken);

    // Clear the cookie by setting maxAge=0 (expires immediately)
    res.cookie(REFRESH_COOKIE_NAME, '', { ...refreshCookieOptions(this._isProduction), maxAge: 0 });
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({ status: 200, description: 'Current user information', type: MeResponseDto })
  async getMe(@CurrentIdentity() user: JwtPayload): Promise<MeResponseDto> {
    let businessId: string | undefined;

    if (user.type === IdentityType.Employee) {
      const employee = await this._employeesService.findByIdentity(user.sub);
      businessId = employee.businessId;
    }

    return plainToInstance(
      MeResponseDto,
      { id: user.sub, ...user, businessId },
      { excludeExtraneousValues: true },
    );
  }
}
