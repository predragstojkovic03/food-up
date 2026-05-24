import { useState } from 'react';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useServices } from '@/shared/infrastructure/di/service.context';
import { GroupBy } from '@/features/dashboard/domain/dashboard-service.interface';
import { DashboardDateRangePicker } from '@/features/dashboard/presentation/components/dashboard-date-range-picker';
import { DashboardKpiCards } from '@/features/dashboard/presentation/components/dashboard-kpi-cards';
import { CostTrendChart } from '@/features/dashboard/presentation/components/cost-trend-chart';
import { SupplierBreakdownChart } from '@/features/dashboard/presentation/components/supplier-breakdown-chart';
import { ChangeRequestTrendChart } from '@/features/dashboard/presentation/components/change-request-trend-chart';
import { WindowRankingTable } from '@/features/dashboard/presentation/components/window-ranking-table';

function toIso(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

export default function ManagerPage() {
  const { t } = useTranslation('employees');
  const { dashboardService } = useServices();

  const today = new Date();
  const [from, setFrom] = useState<Date>(() => startOfMonth(today));
  const [to, setTo] = useState<Date>(() => endOfMonth(today));
  const [groupBy, setGroupBy] = useState<GroupBy>('monthly');

  const fromIso = toIso(from);
  const toIso_ = toIso(to);

  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['dashboard', 'kpis', fromIso, toIso_],
    queryFn: () => dashboardService.getKpis(fromIso, toIso_),
  });

  const { data: costTrend, isLoading: costTrendLoading } = useQuery({
    queryKey: ['dashboard', 'cost-trend', fromIso, toIso_, groupBy],
    queryFn: () => dashboardService.getCostTrend(fromIso, toIso_, groupBy),
  });

  const { data: supplierBreakdown, isLoading: supplierLoading } = useQuery({
    queryKey: ['dashboard', 'supplier-breakdown', fromIso, toIso_],
    queryFn: () => dashboardService.getSupplierBreakdown(fromIso, toIso_),
  });

  const { data: changeRequests, isLoading: changeRequestsLoading } = useQuery({
    queryKey: ['dashboard', 'change-requests', fromIso, toIso_],
    queryFn: () => dashboardService.getChangeRequestCounts(fromIso, toIso_),
  });

  const { data: windowRanking, isLoading: rankingLoading } = useQuery({
    queryKey: ['dashboard', 'window-ranking', fromIso, toIso_],
    queryFn: () => dashboardService.getWindowRanking(fromIso, toIso_),
  });

  function handleDateChange(newFrom: Date, newTo: Date) {
    setFrom(newFrom);
    setTo(newTo);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground">{t('dashboard.subtitle')}</p>
        </div>
        <DashboardDateRangePicker from={from} to={to} onChange={handleDateChange} />
      </div>

      <DashboardKpiCards data={kpis} isLoading={kpisLoading} />

      <CostTrendChart
        data={costTrend}
        isLoading={costTrendLoading}
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <SupplierBreakdownChart data={supplierBreakdown} isLoading={supplierLoading} />
        <ChangeRequestTrendChart data={changeRequests} isLoading={changeRequestsLoading} />
      </div>

      <WindowRankingTable data={windowRanking} isLoading={rankingLoading} />
    </div>
  );
}
