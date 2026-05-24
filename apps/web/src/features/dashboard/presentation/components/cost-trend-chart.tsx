import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { CostTrendItem, GroupBy } from '../../domain/dashboard-service.interface';

interface CostTrendChartProps {
  data: CostTrendItem[] | undefined;
  isLoading: boolean;
  groupBy: GroupBy;
  onGroupByChange: (groupBy: GroupBy) => void;
}

export function CostTrendChart({ data, isLoading, groupBy, onGroupByChange }: CostTrendChartProps) {
  const { t } = useTranslation('employees');

  const chartConfig: ChartConfig = {
    totalCost: {
      label: t('dashboard.costTrend.totalCost'),
      color: 'var(--chart-1)',
    },
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">{t('dashboard.costTrend.title')}</CardTitle>
        <div className="flex gap-1 rounded-md border p-0.5 text-xs">
          <button
            className={`rounded px-2 py-1 transition-colors ${groupBy === 'weekly' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => onGroupByChange('weekly')}
          >
            {t('dashboard.costTrend.weekly')}
          </button>
          <button
            className={`rounded px-2 py-1 transition-colors ${groupBy === 'monthly' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => onGroupByChange('monthly')}
          >
            {t('dashboard.costTrend.monthly')}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : !data?.length ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {t('dashboard.costTrend.noData')}
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="h-48 w-full">
            <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={50} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="totalCost"
                name={t('dashboard.costTrend.totalCost')}
                fill="var(--color-totalCost)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
