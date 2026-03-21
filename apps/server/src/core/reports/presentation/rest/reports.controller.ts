import { Body, Controller, Get, Post, Query, StreamableFile } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { CurrentIdentity } from 'src/core/auth/infrastructure/current-identity.decorator';
import { JwtPayload } from 'src/core/auth/infrastructure/jwt-payload';
import { RequiredEmployeeRole } from 'src/core/employees/presentation/rest/employee-role.decorator';
import { RequiredIdentityType } from 'src/core/identity/presentation/rest/identity-type.decorator';
import { EmployeeRole, IdentityType } from '@food-up/shared';
import { ReportsService } from '../../application/reports.service';
import { SendReportDto } from './dto/send-report.dto';
import { SupplierSendStatusResponseDto } from './dto/supplier-send-status-response.dto';

@ApiTags('Reports')
@Controller('reports')
@ApiBearerAuth()
@RequiredIdentityType(IdentityType.Employee)
@RequiredEmployeeRole(EmployeeRole.Manager)
export class ReportsController {
  constructor(private readonly _reportsService: ReportsService) {}

  @Get('export')
  @ApiOperation({ summary: 'Download XLSX order summary for a meal selection window' })
  @ApiQuery({ name: 'windowId', required: true, type: String })
  @ApiResponse({ status: 200, description: 'XLSX file download' })
  async exportXlsx(
    @Query('windowId') windowId: string,
  ): Promise<StreamableFile> {
    const { buffer, filename } = await this._reportsService.generateXlsx(windowId);
    return new StreamableFile(buffer, {
      disposition: `attachment; filename="${filename}"`,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  }

  @Get('send-status')
  @ApiOperation({ summary: 'Get send status per supplier for a meal selection window' })
  @ApiQuery({ name: 'windowId', required: true, type: String })
  @ApiResponse({ status: 200, type: [SupplierSendStatusResponseDto] })
  async getSendStatus(
    @Query('windowId') windowId: string,
  ): Promise<SupplierSendStatusResponseDto[]> {
    const statuses = await this._reportsService.getSendStatus(windowId);
    return plainToInstance(SupplierSendStatusResponseDto, statuses, {
      strategy: 'excludeAll',
    });
  }

  @Post('send')
  @ApiOperation({ summary: 'Send order summary email to selected suppliers' })
  @ApiResponse({ status: 201, description: 'Emails sent' })
  async sendToSuppliers(
    @Body() dto: SendReportDto,
    @CurrentIdentity() { sub }: JwtPayload,
  ): Promise<void> {
    await this._reportsService.sendToSuppliers(dto.windowId, dto.supplierIds, sub);
  }
}
