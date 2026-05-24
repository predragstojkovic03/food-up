import { EmployeeRole, IdentityType } from '@food-up/shared';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  SerializeOptions,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { Public } from 'src/core/auth/infrastructure/public.decorator';
import { CurrentIdentity } from 'src/core/auth/infrastructure/current-identity.decorator';
import { JwtPayload } from 'src/core/auth/infrastructure/jwt-payload';
import { EmployeesService } from 'src/core/employees/application/employees.service';
import { RequiredEmployeeRole } from 'src/core/employees/presentation/rest/employee-role.decorator';
import { RequiredIdentityType } from 'src/core/identity/presentation/rest/identity-type.decorator';
import { BusinessInvitesService } from '../../../business-invites/application/business-invites.service';
import { BusinessesService } from '../../application/businesses.service';
import { BusinessInviteResponseDto } from './dto/business-invite-response.dto';
import { BusinessResponseDto } from './dto/business-response.dto';
import { CreateBusinessInviteRequestDto } from './dto/create-business-invite.dto';
import { CreateBusinessRequestDto } from './dto/create-business.dto';
import { UpdateBusinessLanguageRequestDto } from './dto/update-business-language-request.dto';

@ApiTags('Businesses')
@Controller('businesses')
export class BusinessesController {
  constructor(
    private readonly _businessesService: BusinessesService,
    private readonly _businessInvitesService: BusinessInvitesService,
    private readonly _employeesService: EmployeesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new business' })
  @ApiResponse({ status: 201, type: BusinessResponseDto })
  @ApiBearerAuth()
  @Public
  async create(
    @Body() createBusinessDto: CreateBusinessRequestDto,
  ): Promise<BusinessResponseDto> {
    const business = await this._businessesService.create(createBusinessDto);
    return plainToInstance(BusinessResponseDto, business);
  }

  @Get()
  @ApiOperation({ summary: 'Get all businesses' })
  @ApiResponse({ status: 200, type: [BusinessResponseDto] })
  @ApiBearerAuth()
  async findAll(): Promise<BusinessResponseDto[]> {
    const businesses = await this._businessesService.findAll();
    return plainToInstance(BusinessResponseDto, businesses);
  }

  @SerializeOptions({ strategy: 'exposeAll' })
  @Get('invites/validate')
  @ApiOperation({
    summary:
      'Check whether an invite token is valid; returns the invited email or null',
  })
  @ApiResponse({ status: 200 })
  @Public
  async validateInvite(
    @Query('token') token: string,
  ): Promise<{ email: string } | null> {
    const email = await this._businessInvitesService.validate(token);
    if (!email) return null;
    return { email };
  }

  @Post(':id/invites')
  @ApiOperation({ summary: 'Create an employee invite link for a business' })
  @ApiResponse({ status: 201, type: BusinessInviteResponseDto })
  @RequiredIdentityType(IdentityType.Employee)
  @RequiredEmployeeRole(EmployeeRole.Manager)
  @ApiBearerAuth()
  async createInvite(
    @Param('id') businessId: string,
    @Body() body: CreateBusinessInviteRequestDto,
  ): Promise<BusinessInviteResponseDto> {
    const invite = await this._businessInvitesService.create(
      businessId,
      body.email,
    );
    return plainToInstance(BusinessInviteResponseDto, invite);
  }

  @Get('my')
  @ApiOperation({ summary: "Get the current manager's business" })
  @ApiResponse({ status: 200, type: BusinessResponseDto })
  @RequiredIdentityType(IdentityType.Employee)
  @RequiredEmployeeRole(EmployeeRole.Manager)
  @ApiBearerAuth()
  async getMy(@CurrentIdentity() { sub }: JwtPayload): Promise<BusinessResponseDto> {
    const employee = await this._employeesService.findByIdentity(sub);
    const business = await this._businessesService.findOne(employee.businessId);
    return plainToInstance(BusinessResponseDto, business, { excludeExtraneousValues: true });
  }

  @Patch('my')
  @ApiOperation({ summary: "Update the current manager's business language" })
  @ApiResponse({ status: 200, type: BusinessResponseDto })
  @RequiredIdentityType(IdentityType.Employee)
  @RequiredEmployeeRole(EmployeeRole.Manager)
  @ApiBearerAuth()
  async updateMyLanguage(
    @Body() dto: UpdateBusinessLanguageRequestDto,
    @CurrentIdentity() { sub }: JwtPayload,
  ): Promise<BusinessResponseDto> {
    const employee = await this._employeesService.findByIdentity(sub);
    const business = await this._businessesService.updateLanguage(employee.businessId, dto.language);
    return plainToInstance(BusinessResponseDto, business, { excludeExtraneousValues: true });
  }
}
