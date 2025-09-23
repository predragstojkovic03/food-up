import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';

import { JwtAuthGuard } from 'src/core/auth/infrastructure/jwt-auth.guard';
import { JwtPayload } from 'src/core/auth/infrastructure/jwt-payload';
import { RequiredEmployeeRole } from 'src/core/employees/presentation/rest/employee-role.decorator';
import { EmployeeRoleGuard } from 'src/core/employees/presentation/rest/employee-role.guard';
import { IdentityType as IdentityTypeEnum } from 'src/core/identity/domain/identity.entity';
import { RequiredIdentityType } from 'src/core/identity/presentation/rest/identity-type.decorator';
import { IdentityTypeGuard } from 'src/core/identity/presentation/rest/identity-type.guard';
import { EmployeeRole } from 'src/shared/domain/role.enum';
import { User } from 'src/shared/infrastructure/user/user.decorator';
import { ChangeRequestsService } from '../../application/change-requests.service';
import { ChangeRequestResponseDto } from './dto/change-request-response.dto';
import { CreateChangeRequestDto } from './dto/create-change-request.dto';
import { UpdateChangeRequestStatusDto } from './dto/update-change-request-status.dto';
import { UpdateChangeRequestDto } from './dto/update-change-request.dto';

@ApiTags('ChangeRequests')
@Controller('change-requests')
export class ChangeRequestsController {
  constructor(private readonly _changeRequestsService: ChangeRequestsService) {}

  @ApiOperation({ summary: 'Create a new change request' })
  @ApiResponse({ status: 201, type: ChangeRequestResponseDto })
  @UseGuards(JwtAuthGuard, IdentityTypeGuard)
  @RequiredIdentityType(IdentityTypeEnum.Employee)
  @Post()
  async create(
    @Body() dto: CreateChangeRequestDto,
    @User() user: JwtPayload,
  ): Promise<ChangeRequestResponseDto> {
    const cr = await this._changeRequestsService.create(user.sub, dto);
    return plainToInstance(ChangeRequestResponseDto, cr);
  }

  @ApiOperation({ summary: 'Get all change requests' })
  @ApiResponse({ status: 200, type: [ChangeRequestResponseDto] })
  @Get()
  async findAll(): Promise<ChangeRequestResponseDto[]> {
    const crs = await this._changeRequestsService.findAll();
    return plainToInstance(ChangeRequestResponseDto, crs);
  }

  @ApiOperation({ summary: 'Get a change request by ID' })
  @ApiResponse({ status: 200, type: ChangeRequestResponseDto })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ChangeRequestResponseDto> {
    const cr = await this._changeRequestsService.findOne(id);
    return plainToInstance(ChangeRequestResponseDto, cr);
  }

  @ApiOperation({ summary: 'Update a change request' })
  @ApiResponse({ status: 200, type: ChangeRequestResponseDto })
  @UseGuards(JwtAuthGuard, IdentityTypeGuard)
  @RequiredIdentityType(IdentityTypeEnum.Employee)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateChangeRequestDto,
    @User() user: JwtPayload,
  ): Promise<ChangeRequestResponseDto> {
    const cr = await this._changeRequestsService.update(id, user.sub, dto);
    return plainToInstance(ChangeRequestResponseDto, cr);
  }

  @ApiOperation({ summary: 'Change status of a change request' })
  @ApiResponse({ status: 200 })
  @UseGuards(JwtAuthGuard, IdentityTypeGuard, EmployeeRoleGuard)
  @RequiredEmployeeRole(EmployeeRole.Manager)
  @RequiredIdentityType(IdentityTypeEnum.Employee)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() { status }: UpdateChangeRequestStatusDto,
    @User() user: JwtPayload,
  ) {
    await this._changeRequestsService.updateStatus(id, user.sub, status);
  }

  @ApiOperation({ summary: 'Delete a change request' })
  @ApiResponse({ status: 204 })
  @UseGuards(JwtAuthGuard, IdentityTypeGuard, EmployeeRoleGuard)
  @RequiredEmployeeRole(EmployeeRole.Manager)
  @RequiredIdentityType(IdentityTypeEnum.Employee)
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this._changeRequestsService.delete(id);
  }
}
