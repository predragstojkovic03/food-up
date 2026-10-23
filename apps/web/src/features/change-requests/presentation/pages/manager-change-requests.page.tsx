import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { groupChangeRequestsByDay } from '@/features/change-requests/application/group-change-requests';
import { useBulkUpdateChangeRequests } from '@/features/change-requests/application/use-bulk-update-change-requests.hook';
import { useWindowChangeRequests } from '@/features/change-requests/application/use-window-change-requests.hook';
import { DayChangeGroupSection } from '@/features/change-requests/presentation/components/day-change-group';
import { useLatestBusinessWindow } from '@/features/meal-selection-windows/application/use-latest-business-window.hook';
import { ChangeRequestStatus, IRichChangeRequest } from '@food-up/shared';
import { ClipboardList } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ChangeRequestGroupsProps {
  changeRequests: IRichChangeRequest[];
  emptyMessage: string;
  disabled: boolean;
  onApprove: (ids: string[]) => void;
  onReject: (ids: string[]) => void;
}

function ChangeRequestGroups({ changeRequests, emptyMessage, ...actions }: ChangeRequestGroupsProps) {
  if (changeRequests.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
        <ClipboardList className="size-10" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupChangeRequestsByDay(changeRequests).map((group) => (
        <DayChangeGroupSection key={group.date ?? 'unknown'} group={group} {...actions} />
      ))}
    </div>
  );
}

export default function ManagerChangeRequestsPage() {
  const { t } = useTranslation('changeRequests');
  const { data: window } = useLatestBusinessWindow();
  const { data: changeRequests = [], isLoading } = useWindowChangeRequests(window?.id);
  const { approve, reject, isPending } = useBulkUpdateChangeRequests(window?.id);

  const pending = changeRequests.filter((cr) => cr.status === ChangeRequestStatus.Pending);
  const handled = changeRequests.filter((cr) => cr.status !== ChangeRequestStatus.Pending);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">{t('title')}</h1>
        <p className="text-muted-foreground text-sm">{window ? t('subtitle') : t('subtitleNoWindow')}</p>
      </div>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-14 w-full rounded-lg" />
          <Skeleton className="h-14 w-full rounded-lg" />
          <Skeleton className="h-14 w-full rounded-lg" />
        </div>
      )}

      {!isLoading && !window && (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
          <ClipboardList className="size-10" />
          <p className="text-sm">{t('noWindow')}</p>
        </div>
      )}

      {!isLoading && window && (
        <Tabs defaultValue="pending">
          <TabsList className="mb-4">
            <TabsTrigger value="pending">{t('tabs.pending', { count: pending.length })}</TabsTrigger>
            <TabsTrigger value="handled">{t('tabs.handled', { count: handled.length })}</TabsTrigger>
          </TabsList>
          <TabsContent value="pending">
            <ChangeRequestGroups
              changeRequests={pending}
              emptyMessage={t('emptyPending')}
              disabled={isPending}
              onApprove={approve}
              onReject={reject}
            />
          </TabsContent>
          <TabsContent value="handled">
            <ChangeRequestGroups
              changeRequests={handled}
              emptyMessage={t('emptyHandled')}
              disabled={isPending}
              onApprove={approve}
              onReject={reject}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
