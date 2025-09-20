import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EmployeesService } from 'src/core/employees/application/employees.service';
import { IdentityService } from 'src/core/identity/application/identity.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly _jwtService: JwtService,
    private readonly _identityService: IdentityService,
    private readonly _employeesService: EmployeesService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Login and get JWT token' })
  @ApiResponse({ status: 200, description: 'JWT access token returned' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() { email, password }: { email: string; password: string },
  ) {
    const identity = await this._identityService.validateCredentials(
      email,
      password,
    );
    if (!identity) throw new UnauthorizedException('Invalid credentials');

    if (identity.type === 'employee') {
      const employee = await this._employeesService.findByIdentity(identity.id);

      if (!employee) throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: identity.id,
      type: identity.type,
    };
    return { access_token: this._jwtService.sign(payload) };
  }
}
