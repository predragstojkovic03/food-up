import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FindEmployeeByIdentityUseCase } from 'src/core/employees/application/use-cases/find-employee-by-identity.user-case';
import { ValidateCredentialsUseCase } from 'src/core/identity/application/use-cases/validate-credentials.use-case';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly validateCredentials: ValidateCredentialsUseCase,
    private readonly jwtService: JwtService,
    private readonly findEmployeeByIdentityUseCase: FindEmployeeByIdentityUseCase,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Login and get JWT token' })
  @ApiResponse({ status: 200, description: 'JWT access token returned' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() { email, password }: { email: string; password: string },
  ) {
    const identity = await this.validateCredentials.execute(email, password);
    if (!identity) throw new UnauthorizedException('Invalid credentials');

    if (identity.type === 'employee') {
      const employee = await this.findEmployeeByIdentityUseCase.execute(
        identity.id,
      );
      if (!employee) throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: identity.id,
      type: identity.type,
    };
    return { access_token: this.jwtService.sign(payload) };
  }
}
