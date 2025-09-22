import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { EmployeesService } from 'src/core/employees/application/employees.service';
import { IdentityService } from 'src/core/identity/application/identity.service';
import { IdentityType } from 'src/core/identity/domain/identity.entity';
import { EmployeeRole } from 'src/shared/domain/role.enum';
import { User } from 'src/shared/infrastructure/user/user.decorator';
import { JwtAuthGuard } from '../../infrastructure/jwt-auth.guard';
import { JwtPayload } from '../../infrastructure/jwt-payload';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { MeResponseDto } from './dto/me-response.dto';

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
  @ApiResponse({
    status: 200,
    description: 'JWT access token returned',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() { email, password }: LoginDto): Promise<AuthResponseDto> {
    const identity = await this._identityService.validateCredentials(
      email,
      password,
    );
    if (!identity) throw new UnauthorizedException('Invalid credentials');

    let role: EmployeeRole | undefined = undefined;
    if (identity.type === IdentityType.Employee) {
      const employee = await this._employeesService.findByIdentity(identity.id);

      if (!employee) throw new UnauthorizedException('Invalid credentials');

      role = employee.role;
    }

    const payload: JwtPayload = {
      sub: identity.id,
      role,
      type: identity.type,
    };

    return plainToInstance(AuthResponseDto, {
      access_token: await this._jwtService.signAsync(payload),
    });
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user information',
  })
  @ApiResponse({
    status: 200,
    description: 'Current user information',
    type: MeResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  getMe(@User() user: JwtPayload): MeResponseDto {
    return plainToInstance(
      MeResponseDto,
      {
        id: user.sub,
        ...user,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
