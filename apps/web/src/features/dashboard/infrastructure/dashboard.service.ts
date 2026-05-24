import { HttpClient } from '@/shared/infrastructure/http/http-client';
import {
  ChangeRequestTrendItem,
  CostTrendItem,
  DashboardKpis,
  GroupBy,
  IDashboardService,
  SupplierBreakdownItem,
  WindowRankingItem,
} from '../domain/dashboard-service.interface';

export class DashboardService implements IDashboardService {
  constructor(private readonly http: HttpClient) {}

  getKpis(from: string, to: string): Promise<DashboardKpis> {
    return this.http.get<DashboardKpis>(`/api/dashboard/kpis?from=${from}&to=${to}`);
  }

  getCostTrend(from: string, to: string, groupBy: GroupBy): Promise<CostTrendItem[]> {
    return this.http.get<CostTrendItem[]>(
      `/api/dashboard/cost-trend?from=${from}&to=${to}&groupBy=${groupBy}`,
    );
  }

  getSupplierBreakdown(from: string, to: string): Promise<SupplierBreakdownItem[]> {
    return this.http.get<SupplierBreakdownItem[]>(
      `/api/dashboard/supplier-breakdown?from=${from}&to=${to}`,
    );
  }

  getChangeRequestCounts(from: string, to: string): Promise<ChangeRequestTrendItem[]> {
    return this.http.get<ChangeRequestTrendItem[]>(
      `/api/dashboard/change-requests?from=${from}&to=${to}`,
    );
  }

  getWindowRanking(from: string, to: string): Promise<WindowRankingItem[]> {
    return this.http.get<WindowRankingItem[]>(
      `/api/dashboard/window-ranking?from=${from}&to=${to}`,
    );
  }
}
