import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';

import { CurrentIdentity } from 'src/core/auth/infrastructure/current-identity.decorator';
import { JwtPayload } from 'src/core/auth/infrastructure/jwt-payload';
import { RequiredEmployeeRole } from 'src/core/employees/presentation/rest/employee-role.decorator';
import { EmployeeRole, IdentityType as IdentityTypeEnum } from '@food-up/shared';
import { RequiredIdentityType } from 'src/core/identity/presentation/rest/identity-type.decorator';
import { EmployeesService } from 'src/core/employees/application/employees.service';
import { ChangeRequestsQueryService } from '../../application/queries/change-requests-query.service';
import { ChangeRequestsService } from '../../application/change-requests.service';
import { BulkUpdateChangeRequestStatusDto } from '../../application/dto/bulk-update-change-request-status.dto';
import { ChangeRequestResponseDto } from './dto/change-request-response.dto';
import { CreateChangeRequestDto } from './dto/create-change-request.dto';
import { PendingCountResponseDto } from './dto/pending-count-response.dto';
import { RichChangeRequestResponseDto } from './dto/rich-change-request-response.dto';
import { UpdateChangeRequestStatusDto } from './dto/update-change-request-status.dto';
import { UpdateChangeRequestDto } from './dto/update-change-request.dto';

@ApiTags('ChangeRequests')
@Controller('change-requests')
export class ChangeRequestsController {
  constructor(
    private readonly _changeRequestsService: ChangeRequestsService,
    private readonly _changeRequestsQueryService: ChangeRequestsQueryService,
    private readonly _employeesService: EmployeesService,
  ) {}

  @ApiOperation({ summary: 'Create a new change request' })
  @ApiResponse({ status: 404, description: "Window or change request not found in the caller's business" })
  @ApiResponse({ status: 201, type: ChangeRequestResponseDto })
  @RequiredIdentityType(IdentityTypeEnum.Employee)
  @ApiBearerAuth()
  @Post()
  async create(
    @Body() dto: CreateChangeRequestDto,
    @CurrentIdentity() user: JwtPayload,
  ): Promise<ChangeRequestResponseDto> {
    const cr = await this._changeRequestsService.create(user.sub, dto);
    return plainToInstance(ChangeRequestResponseDto, cr);
  }

  @ApiOperation({ summary: 'Bulk update status of change requests' })
  @ApiResponse({ status: 200 })
  @RequiredEmployeeRole(EmployeeRole.Manager)
  @RequiredIdentityType(IdentityTypeEnum.Employee)
  @ApiBearerAuth()
  @ApiResponse({ status: 404, description: "Window or change request not found in the caller's business" })
  @Patch('bulk-status')
  async bulkUpdateStatus(
    @Body() dto: BulkUpdateChangeRequestStatusDto,
    @CurrentIdentity() user: JwtPayload,
  ): Promise<void> {
    await this._changeRequestsService.bulkUpdateStatus(dto, user.sub);
  }

  @ApiOperation({ summary: 'Get all change requests for a window (manager view)' })
  @ApiResponse({ status: 200, type: [RichChangeRequestResponseDto] })
  @RequiredEmployeeRole(EmployeeRole.Manager)
  @RequiredIdentityType(IdentityTypeEnum.Employee)
  @ApiBearerAuth()
  @ApiResponse({ status: 404, description: "Window or change request not found in the caller's business" })
  @Get('window/:windowId')
  async findByWindow(
    @Param('windowId') windowId: string,
    @CurrentIdentity() { sub }: JwtPayload,
  ): Promise<RichChangeRequestResponseDto[]> {
    const results = await this._changeRequestsQueryService.findRichByWindowInMyBusiness(windowId, sub);
    return plainToInstance(RichChangeRequestResponseDto, results);
  }

  @ApiOperation({ summary: 'Get pending change request count for a window' })
  @ApiResponse({ status: 200 })
  @RequiredEmployeeRole(EmployeeRole.Manager)
  @RequiredIdentityType(IdentityTypeEnum.Employee)
  @ApiBearerAuth()
  @ApiResponse({ status: 404, description: "Window or change request not found in the caller's business" })
  @Get('window/:windowId/pending-count')
  async getPendingCount(
    @Param('windowId') windowId: string,
    @CurrentIdentity() { sub }: JwtPayload,
  ): Promise<PendingCountResponseDto> {
    const count = await this._changeRequestsQueryService.findPendingCountByWindowInMyBusiness(windowId, sub);
    return plainToInstance(PendingCountResponseDto, { count });
  }

  @ApiOperation({ summary: "Get current employee's change requests" })
  @ApiResponse({ status: 200, type: [RichChangeRequestResponseDto] })
  @RequiredIdentityType(IdentityTypeEnum.Employee)
  @ApiBearerAuth()
  @Get('my')
  async findMy(
    @CurrentIdentity() { sub }: JwtPayload,
  ): Promise<RichChangeRequestResponseDto[]> {
    const employee = await this._employeesService.findByIdentity(sub);
    const results = await this._changeRequestsQueryService.findRichByEmployee(employee.id);
    return plainToInstance(RichChangeRequestResponseDto, results);
  }

  @ApiOperation({ summary: 'Update a change request' })
  @ApiResponse({ status: 200, type: ChangeRequestResponseDto })
  @RequiredIdentityType(IdentityTypeEnum.Employee)
  @ApiBearerAuth()
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateChangeRequestDto,
    @CurrentIdentity() user: JwtPayload,
  ): Promise<ChangeRequestResponseDto> {
    const cr = await this._changeRequestsService.update(id, user.sub, dto);
    return plainToInstance(ChangeRequestResponseDto, cr);
  }

  @ApiOperation({ summary: 'Change status of a change request' })
  @ApiResponse({ status: 200 })
  @RequiredEmployeeRole(EmployeeRole.Manager)
  @RequiredIdentityType(IdentityTypeEnum.Employee)
  @ApiBearerAuth()
  @ApiResponse({ status: 404, description: "Window or change request not found in the caller's business" })
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() { status }: UpdateChangeRequestStatusDto,
    @CurrentIdentity() user: JwtPayload,
  ) {
    await this._changeRequestsService.updateStatus(id, user.sub, status);
  }

  @ApiOperation({ summary: 'Revoke a change request (employee self-service)' })
  @ApiResponse({ status: 200 })
  @RequiredIdentityType(IdentityTypeEnum.Employee)
  @ApiBearerAuth()
  @Patch(':id/revoke')
  async revoke(
    @Param('id') id: string,
    @CurrentIdentity() user: JwtPayload,
  ): Promise<void> {
    await this._changeRequestsService.revoke(id, user.sub);
  }

}
