import { Injectable, Inject } from '@nestjs/common';
import {
  I_DASHBOARD_QUERY_REPOSITORY,
  IDashboardQueryRepository,
  GroupBy,
} from './queries/dashboard-query-repository.interface';
import { DashboardKpisDto } from './dto/dashboard-kpis.dto';
import { CostTrendItemDto } from './dto/cost-trend-item.dto';
import { SupplierBreakdownItemDto } from './dto/supplier-breakdown-item.dto';
import { ChangeRequestTrendItemDto } from './dto/change-request-trend-item.dto';
import { WindowRankingItemDto } from './dto/window-ranking-item.dto';

@Injectable()
export class DashboardQueryService {
  constructor(
    @Inject(I_DASHBOARD_QUERY_REPOSITORY)
    private readonly _repository: IDashboardQueryRepository,
  ) {}

  getKpis(from: string, to: string, businessId: string): Promise<DashboardKpisDto> {
    return this._repository.getKpis(from, to, businessId);
  }

  getCostTrend(
    from: string,
    to: string,
    groupBy: GroupBy,
    businessId: string,
  ): Promise<CostTrendItemDto[]> {
    return this._repository.getCostTrend(from, to, groupBy, businessId);
  }

  getSupplierBreakdown(
    from: string,
    to: string,
    businessId: string,
  ): Promise<SupplierBreakdownItemDto[]> {
    return this._repository.getSupplierBreakdown(from, to, businessId);
  }

  getChangeRequestCounts(
    from: string,
    to: string,
    businessId: string,
  ): Promise<ChangeRequestTrendItemDto[]> {
    return this._repository.getChangeRequestCounts(from, to, businessId);
  }

  getWindowRanking(
    from: string,
    to: string,
    businessId: string,
  ): Promise<WindowRankingItemDto[]> {
    return this._repository.getWindowRanking(from, to, businessId);
  }
}
