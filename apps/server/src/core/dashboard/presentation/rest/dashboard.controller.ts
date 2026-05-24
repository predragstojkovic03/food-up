import { EmployeeRole, IdentityType } from '@food-up/shared';
import { CacheTTL } from '@nestjs/cache-manager';
import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { CurrentIdentity } from 'src/core/auth/infrastructure/current-identity.decorator';
import { JwtPayload } from 'src/core/auth/infrastructure/jwt-payload';
import { BusinessesService } from 'src/core/businesses/application/businesses.service';
import { RequiredEmployeeRole } from 'src/core/employees/presentation/rest/employee-role.decorator';
import { EmployeesService } from 'src/core/employees/application/employees.service';
import { RequiredIdentityType } from 'src/core/identity/presentation/rest/identity-type.decorator';
import { DashboardQueryService } from '../../application/dashboard-query.service';
import { DashboardDateRangeQueryDto, DashboardCostTrendQueryDto } from './dto/dashboard-date-range-query.dto';
import { DashboardKpisResponseDto } from './dto/dashboard-kpis-response.dto';
import { CostTrendItemResponseDto } from './dto/cost-trend-item-response.dto';
import { SupplierBreakdownItemResponseDto } from './dto/supplier-breakdown-item-response.dto';
import { ChangeRequestTrendItemResponseDto } from './dto/change-request-trend-item-response.dto';
import { WindowRankingItemResponseDto } from './dto/window-ranking-item-response.dto';

const TO_INSTANCE = { strategy: 'excludeAll' } as const;

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
    private readonly _businessesService: BusinessesService,
  ) {}

  @Get('kpis')
  @CacheTTL(300_000)
  @ApiOperation({ summary: 'Get KPI summary cards for the dashboard' })
  @ApiResponse({ status: 200, type: DashboardKpisResponseDto })
  async getKpis(
    @Query() { from, to }: DashboardDateRangeQueryDto,
    @CurrentIdentity() { sub }: JwtPayload,
  ): Promise<DashboardKpisResponseDto> {
    const employee = await this._employeesService.findByIdentity(sub);
    const data = await this._dashboardService.getKpis(from, to, employee.businessId);
    return plainToInstance(DashboardKpisResponseDto, data, TO_INSTANCE);
  }

  @Get('cost-trend')
  @CacheTTL(300_000)
  @ApiOperation({ summary: 'Get cost trend grouped by week or month' })
  @ApiResponse({ status: 200, type: [CostTrendItemResponseDto] })
  async getCostTrend(
    @Query() { from, to, groupBy }: DashboardCostTrendQueryDto,
    @CurrentIdentity() { sub }: JwtPayload,
  ): Promise<CostTrendItemResponseDto[]> {
    const employee = await this._employeesService.findByIdentity(sub);
    const business = await this._businessesService.findOne(employee.businessId);
    const data = await this._dashboardService.getCostTrend(from, to, groupBy ?? 'monthly', employee.businessId, business.language);
    return plainToInstance(CostTrendItemResponseDto, data, TO_INSTANCE);
  }

  @Get('supplier-breakdown')
  @CacheTTL(300_000)
  @ApiOperation({ summary: 'Get cost breakdown by supplier per window' })
  @ApiResponse({ status: 200, type: [SupplierBreakdownItemResponseDto] })
  async getSupplierBreakdown(
    @Query() { from, to }: DashboardDateRangeQueryDto,
    @CurrentIdentity() { sub }: JwtPayload,
  ): Promise<SupplierBreakdownItemResponseDto[]> {
    const employee = await this._employeesService.findByIdentity(sub);
    const business = await this._businessesService.findOne(employee.businessId);
    const data = await this._dashboardService.getSupplierBreakdown(from, to, employee.businessId, business.language);
    return plainToInstance(SupplierBreakdownItemResponseDto, data, TO_INSTANCE);
  }

  @Get('change-requests')
  @CacheTTL(300_000)
  @ApiOperation({ summary: 'Get change request counts per window' })
  @ApiResponse({ status: 200, type: [ChangeRequestTrendItemResponseDto] })
  async getChangeRequestCounts(
    @Query() { from, to }: DashboardDateRangeQueryDto,
    @CurrentIdentity() { sub }: JwtPayload,
  ): Promise<ChangeRequestTrendItemResponseDto[]> {
    const employee = await this._employeesService.findByIdentity(sub);
    const business = await this._businessesService.findOne(employee.businessId);
    const data = await this._dashboardService.getChangeRequestCounts(from, to, employee.businessId, business.language);
    return plainToInstance(ChangeRequestTrendItemResponseDto, data, TO_INSTANCE);
  }

  @Get('window-ranking')
  @CacheTTL(300_000)
  @ApiOperation({ summary: 'Get meal selection windows ranked by total cost descending' })
  @ApiResponse({ status: 200, type: [WindowRankingItemResponseDto] })
  async getWindowRanking(
    @Query() { from, to }: DashboardDateRangeQueryDto,
    @CurrentIdentity() { sub }: JwtPayload,
  ): Promise<WindowRankingItemResponseDto[]> {
    const employee = await this._employeesService.findByIdentity(sub);
    const business = await this._businessesService.findOne(employee.businessId);
    const data = await this._dashboardService.getWindowRanking(from, to, employee.businessId, business.language);
    return plainToInstance(WindowRankingItemResponseDto, data, TO_INSTANCE);
  }
}
