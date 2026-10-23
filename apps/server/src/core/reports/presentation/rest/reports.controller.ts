import { EmployeeRole, IdentityType } from '@food-up/shared';
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
import { ReportsService } from '../../application/reports.service';
import { MailPreviewResponseDto } from './dto/mail-preview-response.dto';
import { OrderSummarySendResponseDto } from './dto/order-summary-send-response.dto';
import { SendReportDto } from './dto/send-report.dto';
import { SupplierSendStatusResponseDto } from './dto/supplier-send-status-response.dto';
import { WindowCostSummaryResponseDto } from './dto/window-cost-summary-response.dto';

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
  @ApiResponse({ status: 404, description: "Window not found or belongs to another business" })
  async exportXlsx(
    @Query('windowId') windowId: string,
    @CurrentIdentity() { sub }: JwtPayload,
  ): Promise<StreamableFile> {
    const { buffer, filename } = await this._reportsService.generateXlsx(windowId, sub);
    return new StreamableFile(buffer, {
      disposition: `attachment; filename="${filename}"`,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  }

  @Get('send-status')
  @ApiOperation({ summary: 'Get send status per supplier for a meal selection window' })
  @ApiQuery({ name: 'windowId', required: true, type: String })
  @ApiResponse({ status: 200, type: [SupplierSendStatusResponseDto] })
  @ApiResponse({ status: 404, description: "Window not found or belongs to another business" })
  async getSendStatus(
    @Query('windowId') windowId: string,
    @CurrentIdentity() { sub }: JwtPayload,
  ): Promise<SupplierSendStatusResponseDto[]> {
    const statuses = await this._reportsService.getSendStatus(windowId, sub);
    return plainToInstance(SupplierSendStatusResponseDto, statuses, {
      strategy: 'excludeAll',
    });
  }

  @Get('preview')
  @ApiOperation({ summary: 'Generate email preview for a supplier' })
  @ApiQuery({ name: 'windowId', required: true, type: String })
  @ApiQuery({ name: 'supplierId', required: true, type: String })
  @ApiResponse({ status: 200, type: MailPreviewResponseDto })
  @ApiResponse({ status: 400, description: 'Supplier has no orders in the window' })
  @ApiResponse({ status: 404, description: "Window not found or belongs to another business" })
  async getPreview(
    @Query('windowId') windowId: string,
    @Query('supplierId') supplierId: string,
    @CurrentIdentity() { sub }: JwtPayload,
  ): Promise<MailPreviewResponseDto> {
    const preview = await this._reportsService.generatePreview(windowId, supplierId, sub);
    return plainToInstance(MailPreviewResponseDto, { supplierId, ...preview }, { strategy: 'excludeAll' });
  }

  @Post('send')
  @ApiOperation({ summary: 'Send order summary email to selected suppliers' })
  @ApiResponse({ status: 201, description: 'Emails sent' })
  @ApiResponse({ status: 400, description: 'A supplier has no orders in the window' })
  @ApiResponse({ status: 404, description: "Window not found or belongs to another business" })
  async sendToSuppliers(
    @Body() dto: SendReportDto,
    @CurrentIdentity() { sub }: JwtPayload,
  ): Promise<void> {
    await this._reportsService.sendToSuppliers(dto.windowId, dto.suppliers, sub);
  }

  @Get('cost-summary')
  @ApiOperation({ summary: 'Get estimated cost breakdown by supplier for a meal selection window' })
  @ApiQuery({ name: 'windowId', required: true, type: String })
  @ApiResponse({ status: 200, type: [WindowCostSummaryResponseDto] })
  @ApiResponse({ status: 404, description: "Window not found or belongs to another business" })
  async getCostSummary(
    @Query('windowId') windowId: string,
    @CurrentIdentity() { sub }: JwtPayload,
  ): Promise<WindowCostSummaryResponseDto[]> {
    const rows = await this._reportsService.getCostSummary(windowId, sub);
    return plainToInstance(WindowCostSummaryResponseDto, rows, { strategy: 'excludeAll' });
  }

  @Get('sends')
  @ApiOperation({ summary: 'Get all sent order summaries for a meal selection window' })
  @ApiQuery({ name: 'windowId', required: true, type: String })
  @ApiResponse({ status: 200, type: [OrderSummarySendResponseDto] })
  @ApiResponse({ status: 404, description: "Window not found or belongs to another business" })
  async getAllSends(
    @Query('windowId') windowId: string,
    @CurrentIdentity() { sub }: JwtPayload,
  ): Promise<OrderSummarySendResponseDto[]> {
    const sends = await this._reportsService.getAllSends(windowId, sub);
    return plainToInstance(OrderSummarySendResponseDto, sends, { strategy: 'excludeAll' });
  }
}
