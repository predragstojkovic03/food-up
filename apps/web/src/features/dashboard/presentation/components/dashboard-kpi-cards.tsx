import { TrendingDownIcon, TrendingUpIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRSD } from '@/lib/utils';
import { DashboardKpis } from '../../domain/dashboard-service.interface';

interface DashboardKpiCardsProps {
  data: DashboardKpis | undefined;
  isLoading: boolean;
}

function ChangeIndicator({ change }: { change: number | null }) {
  const { t } = useTranslation('employees');
  if (change == null) return null;
  const positive = change >= 0;
  return (
    <p className={`flex items-center gap-1 text-xs ${positive ? 'text-green-600' : 'text-red-500'}`}>
      {positive ? <TrendingUpIcon size={12} /> : <TrendingDownIcon size={12} />}
      {positive ? '+' : ''}{change.toFixed(1)}% {t('dashboard.kpi.vsPrev')}
    </p>
  );
}

function KpiSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-24 mb-1" />
        <Skeleton className="h-3 w-40" />
      </CardContent>
    </Card>
  );
}

export function DashboardKpiCards({ data, isLoading }: DashboardKpiCardsProps) {
  const { t } = useTranslation('employees');

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <KpiSkeleton key={i} />)}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('dashboard.kpi.totalSpend')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatRSD(data.totalSpend)}</p>
          <ChangeIndicator change={data.totalSpendChange} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('dashboard.kpi.avgCostPerWindow')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatRSD(data.avgCostPerWindow)}</p>
          <ChangeIndicator change={data.avgCostPerWindowChange} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('dashboard.kpi.topSupplier')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold truncate">
            {data.topSupplier?.name ?? t('dashboard.kpi.noTopSupplier')}
          </p>
          {data.topSupplier && (
            <p className="text-xs text-muted-foreground">{formatRSD(data.topSupplier.totalCost)}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('dashboard.kpi.changeRequests')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{data.totalChangeRequests}</p>
          <ChangeIndicator change={data.totalChangeRequestsChange} />
        </CardContent>
      </Card>
    </div>
  );
}
