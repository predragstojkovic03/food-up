import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useWindowDailyOverview } from '@/features/meal-selections/application/use-window-daily-overview.hook';
import { IWindowDailyOverviewItem } from '@food-up/shared';
import { MealType } from '@food-up/shared';
import { useTranslation } from 'react-i18next';

interface DailyOrderDialogProps {
  windowId: string;
  date: string | null;
  formattedDate: string;
  availableMealTypes: MealType[];
  onClose: () => void;
}

export function DailyOrderDialog({
  windowId,
  date,
  formattedDate,
  availableMealTypes,
  onClose,
}: DailyOrderDialogProps) {
  const { t } = useTranslation('meals');
  const { t: tEmp } = useTranslation('employees');
  const { data: items = [], isError, isLoading } = useWindowDailyOverview(windowId);

  const dayItems = date ? items.filter((item) => item.date === date) : [];

  const colSpan = 2 + availableMealTypes.length;

  return (
    <Dialog open={date !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className='sm:w-fit sm:max-w-[calc(100vw-2rem)] max-h-[80vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle>
            {t('windows.detail.dailyOverview.dialogTitle', { date: formattedDate })}
          </DialogTitle>
        </DialogHeader>

        {isError && (
          <p className='text-sm text-destructive py-4 text-center'>
            {t('windows.detail.dailyOverview.loadingError')}
          </p>
        )}

        {!isError && (
          <div className='overflow-auto flex-1'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b bg-muted/40 text-xs font-medium text-muted-foreground'>
                  <th className='px-3 py-2 text-left font-medium'>
                    {t('windows.detail.dailyOverview.colEmployee')}
                  </th>
                  {availableMealTypes.map((type) => (
                    <th key={type} className='px-3 py-2 text-left font-medium'>
                      {tEmp(`mealTypes.${type}`)}
                    </th>
                  ))}
                  <th className='px-3 py-2 text-left font-medium'>
                    {t('windows.detail.dailyOverview.colStatus')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={colSpan} className='px-3 py-4 text-center text-sm text-muted-foreground'>
                      {t('windows.detail.loading')}
                    </td>
                  </tr>
                ) : dayItems.length === 0 ? (
                  <tr>
                    <td colSpan={colSpan} className='px-3 py-4 text-center text-sm text-muted-foreground'>
                      {t('windows.detail.menuItems.emptyForDate')}
                    </td>
                  </tr>
                ) : (
                  dayItems.map((item) => (
                    <DailyOrderRow
                      key={item.employeeId}
                      item={item}
                      availableMealTypes={availableMealTypes}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DailyOrderRow({
  item,
  availableMealTypes,
}: {
  item: IWindowDailyOverviewItem;
  availableMealTypes: MealType[];
}) {
  const { t } = useTranslation('meals');

  const rowClass =
    item.status === 'no_record'
      ? 'border-b bg-destructive/10 last:border-b-0'
      : 'border-b last:border-b-0';

  return (
    <tr className={rowClass}>
      <td className='px-3 py-2.5 font-medium'>{item.employeeName}</td>
      {availableMealTypes.map((type) => {
        const meal = item.meals.find((m) => m.type === type);
        return (
          <td key={type} className='px-3 py-2.5 text-muted-foreground'>
            {meal ? meal.name : t('windows.detail.dailyOverview.noMeals')}
          </td>
        );
      })}
      <td className='px-3 py-2.5'>
        {item.status === 'ordered' && (
          <Badge variant='default' className='text-xs'>
            {t('windows.detail.dailyOverview.statusOrdered')}
          </Badge>
        )}
        {item.status === 'skipped' && (
          <Badge variant='secondary' className='text-xs'>
            {t('windows.detail.dailyOverview.statusSkipped')}
          </Badge>
        )}
      </td>
    </tr>
  );
}
