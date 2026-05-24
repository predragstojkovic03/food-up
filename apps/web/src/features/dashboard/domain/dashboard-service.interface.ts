export type GroupBy = 'weekly' | 'monthly';

export type DashboardKpis = {
  totalSpend: number;
  totalSpendChange: number | null;
  avgCostPerWindow: number;
  avgCostPerWindowChange: number | null;
  topSupplier: { name: string; totalCost: number } | null;
  totalChangeRequests: number;
  totalChangeRequestsChange: number | null;
};

export type CostTrendItem = {
  period: string;
  label: string;
  totalCost: number;
};

export type SupplierCost = {
  supplierId: string;
  supplierName: string;
  cost: number;
};

export type SupplierBreakdownItem = {
  windowId: string;
  windowLabel: string;
  windowStart: string;
  suppliers: SupplierCost[];
};

export type ChangeRequestTrendItem = {
  windowId: string;
  windowLabel: string;
  windowStart: string;
  count: number;
};

export type WindowRankingItem = {
  windowId: string;
  windowLabel: string;
  startDate: string;
  endDate: string;
  supplierNames: string[];
  totalCost: number;
};

export interface IDashboardService {
  getKpis(from: string, to: string): Promise<DashboardKpis>;
  getCostTrend(from: string, to: string, groupBy: GroupBy): Promise<CostTrendItem[]>;
  getSupplierBreakdown(from: string, to: string): Promise<SupplierBreakdownItem[]>;
  getChangeRequestCounts(from: string, to: string): Promise<ChangeRequestTrendItem[]>;
  getWindowRanking(from: string, to: string): Promise<WindowRankingItem[]>;
}
