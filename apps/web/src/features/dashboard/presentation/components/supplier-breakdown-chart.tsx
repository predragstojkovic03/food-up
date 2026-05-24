import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { SupplierBreakdownItem } from '../../domain/dashboard-service.interface';

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

interface SupplierBreakdownChartProps {
  data: SupplierBreakdownItem[] | undefined;
  isLoading: boolean;
}

export function SupplierBreakdownChart({ data, isLoading }: SupplierBreakdownChartProps) {
  const { t } = useTranslation('employees');

  const { chartData, supplierNames, chartConfig } = useMemo(() => {
    if (!data?.length) return { chartData: [], supplierNames: [], chartConfig: {} as ChartConfig };

    const names = Array.from(
      new Set(data.flatMap((w) => w.suppliers.map((s) => s.supplierName))),
    );

    const rows = [...data]
      .sort((a, b) => a.windowStart.localeCompare(b.windowStart))
      .map((w) => {
        const row: Record<string, string | number> = { windowLabel: w.windowLabel };
        for (const s of w.suppliers) {
          row[s.supplierName] = s.cost;
        }
        return row;
      });

    const config: ChartConfig = Object.fromEntries(
      names.map((name, i) => [name, { label: name, color: COLORS[i % COLORS.length] }]),
    );

    return { chartData: rows, supplierNames: names, chartConfig: config };
  }, [data]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t('dashboard.supplierBreakdown.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-56 w-full" />
        ) : !chartData.length ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {t('dashboard.supplierBreakdown.noData')}
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="h-56 w-full">
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="windowLabel" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={50} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              {supplierNames.map((name, i) => (
                <Bar
                  key={name}
                  dataKey={name}
                  stackId="a"
                  fill={COLORS[i % COLORS.length]}
                  radius={i === supplierNames.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                />
              ))}
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
