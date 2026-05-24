import { EmployeeRole, IdentityType } from '@food-up/shared';
import { CacheTTL } from '@nestjs/cache-manager';
import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentIdentity } from 'src/core/auth/infrastructure/current-identity.decorator';
import { JwtPayload } from 'src/core/auth/infrastructure/jwt-payload';
import { RequiredEmployeeRole } from 'src/core/employees/presentation/rest/employee-role.decorator';
import { EmployeesService } from 'src/core/employees/application/employees.service';
import { RequiredIdentityType } from 'src/core/identity/presentation/rest/identity-type.decorator';
import { DashboardQueryService } from '../../application/dashboard-query.service';
import { DashboardDateRangeQueryDto, DashboardCostTrendQueryDto } from './dto/dashboard-date-range-query.dto';

@ApiTags('Dashboard')
@Controller('dashboard')
@ApiBearerAuth()
@RequiredIdentityType(IdentityType.Employee)
@RequiredEmployeeRole(EmployeeRole.Manager)
@UseInterceptors(CacheInterceptor)
export class DashboardController {
  constructor(
    private readonly _dashboardService: DashboardQueryService,
    private readonly _employeesService: EmployeesService,
  ) {}

  @Get('kpis')
  @CacheTTL(300_000)
  @ApiOperation({ summary: 'Get KPI summary cards for the dashboard' })
  @ApiResponse({ status: 200 })
  async getKpis(
    @Query() { from, to }: DashboardDateRangeQueryDto,
    @CurrentIdentity() { sub }: JwtPayload,
  ) {
    const employee = await this._employeesService.findByIdentity(sub);
    return this._dashboardService.getKpis(from, to, employee.businessId);
  }

  @Get('cost-trend')
  @CacheTTL(300_000)
  @ApiOperation({ summary: 'Get cost trend grouped by week or month' })
  @ApiResponse({ status: 200 })
  async getCostTrend(
    @Query() { from, to, groupBy }: DashboardCostTrendQueryDto,
    @CurrentIdentity() { sub }: JwtPayload,
  ) {
    const employee = await this._employeesService.findByIdentity(sub);
    return this._dashboardService.getCostTrend(from, to, groupBy ?? 'monthly', employee.businessId);
  }

  @Get('supplier-breakdown')
  @CacheTTL(300_000)
  @ApiOperation({ summary: 'Get cost breakdown by supplier per window' })
  @ApiResponse({ status: 200 })
  async getSupplierBreakdown(
    @Query() { from, to }: DashboardDateRangeQueryDto,
    @CurrentIdentity() { sub }: JwtPayload,
  ) {
    const employee = await this._employeesService.findByIdentity(sub);
    return this._dashboardService.getSupplierBreakdown(from, to, employee.businessId);
  }

  @Get('change-requests')
  @CacheTTL(300_000)
  @ApiOperation({ summary: 'Get change request counts per window' })
  @ApiResponse({ status: 200 })
  async getChangeRequestCounts(
    @Query() { from, to }: DashboardDateRangeQueryDto,
    @CurrentIdentity() { sub }: JwtPayload,
  ) {
    const employee = await this._employeesService.findByIdentity(sub);
    return this._dashboardService.getChangeRequestCounts(from, to, employee.businessId);
  }

  @Get('window-ranking')
  @CacheTTL(300_000)
  @ApiOperation({ summary: 'Get meal selection windows ranked by total cost descending' })
  @ApiResponse({ status: 200 })
  async getWindowRanking(
    @Query() { from, to }: DashboardDateRangeQueryDto,
    @CurrentIdentity() { sub }: JwtPayload,
  ) {
    const employee = await this._employeesService.findByIdentity(sub);
    return this._dashboardService.getWindowRanking(from, to, employee.businessId);
  }
}
