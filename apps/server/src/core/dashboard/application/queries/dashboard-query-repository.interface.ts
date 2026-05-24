import { CostTrendItemDto } from '../dto/cost-trend-item.dto';
import { SupplierBreakdownItemDto } from '../dto/supplier-breakdown-item.dto';
import { ChangeRequestTrendItemDto } from '../dto/change-request-trend-item.dto';
import { WindowRankingItemDto } from '../dto/window-ranking-item.dto';
import { DashboardKpisDto } from '../dto/dashboard-kpis.dto';

export const I_DASHBOARD_QUERY_REPOSITORY = Symbol('IDashboardQueryRepository');

export type GroupBy = 'weekly' | 'monthly';

export interface IDashboardQueryRepository {
  getKpis(from: string, to: string, businessId: string): Promise<DashboardKpisDto>;
  getCostTrend(from: string, to: string, groupBy: GroupBy, businessId: string): Promise<CostTrendItemDto[]>;
  getSupplierBreakdown(from: string, to: string, businessId: string): Promise<SupplierBreakdownItemDto[]>;
  getChangeRequestCounts(from: string, to: string, businessId: string): Promise<ChangeRequestTrendItemDto[]>;
  getWindowRanking(from: string, to: string, businessId: string): Promise<WindowRankingItemDto[]>;
}
