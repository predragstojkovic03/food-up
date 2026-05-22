import { useMyChangeRequests } from '@/features/change-requests/application/use-my-change-requests.hook';
import { useMySelectionsForWindow } from '@/features/meal-selections/application/use-my-selections.hook';
import { useRelevantWindow } from '@/features/meal-selection-windows/application/use-relevant-window.hook';
import { CalendarX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { WindowStatusCard, WindowStatusCardSkeleton } from './components/window-status-card';

export default function EmployeeHomePage() {
  const { t } = useTranslation('employees');
  const { data: window, isLoading: windowLoading } = useRelevantWindow();
  const { data: selections = [], isLoading: selectionsLoading } =
    useMySelectionsForWindow(window?.id);
  const { data: changeRequests = [] } = useMyChangeRequests();

  const isLoading = windowLoading || (!!window && selectionsLoading);

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto py-4">
      <div>
        <h1 className="text-xl font-bold">{t('home.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('home.subtitle')}
        </p>
      </div>

      {isLoading && <WindowStatusCardSkeleton />}

      {!isLoading && window && (
        <WindowStatusCard window={window} selections={selections} changeRequests={changeRequests} />
      )}

      {!isLoading && !window && (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
          <CalendarX className="size-10" />
          <p className="text-sm">{t('home.empty')}</p>
        </div>
      )}
    </div>
  );
}
