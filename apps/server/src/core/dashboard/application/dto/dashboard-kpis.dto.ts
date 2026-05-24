export type DashboardKpisDto = {
  totalSpend: number;
  totalSpendChange: number | null;
  avgCostPerWindow: number;
  avgCostPerWindowChange: number | null;
  topSupplier: { name: string; totalCost: number } | null;
  totalChangeRequests: number;
  totalChangeRequestsChange: number | null;
};
