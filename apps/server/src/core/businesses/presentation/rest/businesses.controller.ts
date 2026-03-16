import { EmployeeRole, IdentityType } from '@food-up/shared';
import {
  Body,
  Controller,
  Get,
  Param,
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
import { RequiredEmployeeRole } from 'src/core/employees/presentation/rest/employee-role.decorator';
import { RequiredIdentityType } from 'src/core/identity/presentation/rest/identity-type.decorator';
import { BusinessInvitesService } from '../../../business-invites/application/business-invites.service';
import { BusinessesService } from '../../application/businesses.service';
import { BusinessInviteResponseDto } from './dto/business-invite-response.dto';
import { BusinessResponseDto } from './dto/business-response.dto';
import { CreateBusinessInviteRequestDto } from './dto/create-business-invite.dto';
import { CreateBusinessRequestDto } from './dto/create-business.dto';

@ApiTags('Businesses')
@Controller('businesses')
export class BusinessesController {
  constructor(
    private readonly _businessesService: BusinessesService,
    private readonly _businessInvitesService: BusinessInvitesService,
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
}
