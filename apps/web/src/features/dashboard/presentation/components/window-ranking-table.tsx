import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatRSD } from '@/lib/utils';
import { WindowRankingItem } from '../../domain/dashboard-service.interface';

interface WindowRankingTableProps {
  data: WindowRankingItem[] | undefined;
  isLoading: boolean;
}

export function WindowRankingTable({ data, isLoading }: WindowRankingTableProps) {
  const { t } = useTranslation('employees');

  const sorted = data ? [...data].sort((a, b) => b.totalCost - a.totalCost) : [];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t('dashboard.windowRanking.title')}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : !sorted.length ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {t('dashboard.windowRanking.noData')}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">#</TableHead>
                <TableHead>{t('dashboard.windowRanking.colWindow')}</TableHead>
                <TableHead>{t('dashboard.windowRanking.colSuppliers')}</TableHead>
                <TableHead className="text-right pr-6">{t('dashboard.windowRanking.colTotalCost')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((item, index) => (
                <TableRow key={item.windowId}>
                  <TableCell className="pl-6 text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="font-medium">{item.windowLabel}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.supplierNames.join(', ')}
                  </TableCell>
                  <TableCell className="text-right pr-6 font-mono">
                    {formatRSD(item.totalCost)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
