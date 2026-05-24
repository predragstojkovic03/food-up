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
import { ChangeRequestTrendItem } from '../../domain/dashboard-service.interface';

const chartConfig: ChartConfig = {
  count: {
    color: 'hsl(var(--chart-2))',
  },
};

interface ChangeRequestTrendChartProps {
  data: ChangeRequestTrendItem[] | undefined;
  isLoading: boolean;
}

export function ChangeRequestTrendChart({ data, isLoading }: ChangeRequestTrendChartProps) {
  const { t } = useTranslation('employees');

  const sorted = data
    ? [...data].sort((a, b) => a.windowStart.localeCompare(b.windowStart))
    : [];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t('dashboard.changeRequestTrend.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-56 w-full" />
        ) : !sorted.length ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {t('dashboard.changeRequestTrend.noData')}
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="h-56 w-full">
            <BarChart data={sorted} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="windowLabel" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                width={30}
                allowDecimals={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="count"
                name={t('dashboard.changeRequestTrend.count')}
                fill="var(--color-count)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
