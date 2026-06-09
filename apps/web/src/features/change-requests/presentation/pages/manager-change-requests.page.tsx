import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useWindowChangeRequests } from '@/features/change-requests/application/use-window-change-requests.hook';
import { useLatestBusinessWindow } from '@/features/meal-selection-windows/application/use-latest-business-window.hook';
import { useServices } from '@/shared/infrastructure/di/service.context';
import { ChangeRequestStatus, IBulkUpdateChangeRequestStatusItem, IRichChangeRequest } from '@food-up/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, ClipboardList, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const STATUS_VARIANTS: Record<ChangeRequestStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  [ChangeRequestStatus.Pending]: 'outline',
  [ChangeRequestStatus.Approved]: 'default',
  [ChangeRequestStatus.Rejected]: 'destructive',
  [ChangeRequestStatus.Revoked]: 'secondary',
};


const LOCALE: Record<string, string> = { en: 'en-US', sr: 'sr-Latn' };

function formatDate(iso: string, language: string): string {
  return new Date(iso).toLocaleDateString(LOCALE[language] ?? language, { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function ManagerChangeRequestsPage() {
  const { t, i18n } = useTranslation('changeRequests');
  const queryClient = useQueryClient();
  const { changeRequestService } = useServices();
  const { data: window } = useLatestBusinessWindow();
  const { data: changeRequests = [], isLoading } = useWindowChangeRequests(window?.id);

  const STATUS_LABELS: Record<ChangeRequestStatus, string> = {
    [ChangeRequestStatus.Pending]: t('status.pending', { ns: 'common' }),
    [ChangeRequestStatus.Approved]: t('status.approved', { ns: 'common' }),
    [ChangeRequestStatus.Rejected]: t('status.rejected', { ns: 'common' }),
    [ChangeRequestStatus.Revoked]: t('status.revoked', { ns: 'common' }),
  };

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const bulkUpdate = useMutation({
    mutationFn: (items: IBulkUpdateChangeRequestStatusItem[]) =>
      changeRequestService.bulkUpdateStatus({ items }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['change-requests', 'window', window?.id] });
      queryClient.invalidateQueries({ queryKey: ['change-requests', 'pending-count', window?.id] });
      setSelectedIds(new Set());
    },
  });

  const pendingCRs = changeRequests.filter((cr) => cr.status === ChangeRequestStatus.Pending);
  const allPendingSelected = pendingCRs.length > 0 && pendingCRs.every((cr) => selectedIds.has(cr.id));

  function toggleSelectAll() {
    if (allPendingSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingCRs.map((cr) => cr.id)));
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleBulkApprove() {
    const items = [...selectedIds].map((id) => ({ id, status: ChangeRequestStatus.Approved }));
    bulkUpdate.mutate(items);
  }

  function handleBulkReject() {
    const items = [...selectedIds].map((id) => ({ id, status: ChangeRequestStatus.Rejected }));
    bulkUpdate.mutate(items);
  }

  function handleSingleUpdate(cr: IRichChangeRequest, status: ChangeRequestStatus) {
    bulkUpdate.mutate([{ id: cr.id, status }]);
  }

  const selectedCount = selectedIds.size;
  const isPending = bulkUpdate.isPending;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">{t('title')}</h1>
          <p className="text-muted-foreground text-sm">
            {window ? t('subtitle') : t('subtitleNoWindow')}
          </p>
        </div>

        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{selectedCount} {t('selectedCount')}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkReject}
              disabled={isPending}
              className="gap-1.5"
            >
              <X className="size-3.5" />
              {t('actions.reject')}
            </Button>
            <Button
              size="sm"
              onClick={handleBulkApprove}
              disabled={isPending}
              className="gap-1.5"
            >
              <Check className="size-3.5" />
              {t('actions.approve')}
            </Button>
          </div>
        )}
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

      {!isLoading && window && changeRequests.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
          <ClipboardList className="size-10" />
          <p className="text-sm">{t('table.empty')}</p>
        </div>
      )}

      {!isLoading && changeRequests.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto_auto] items-center gap-4 px-4 py-2.5 bg-muted/40 border-b text-xs font-medium text-muted-foreground">
            {pendingCRs.length > 0 ? (
              <Checkbox
                checked={allPendingSelected}
                onCheckedChange={toggleSelectAll}
              />
            ) : (
              <span />
            )}
            <span>{t('table.employeeHeader')}</span>
            <span>{t('table.dateHeader')}</span>
            <span>{t('table.changeHeader')}</span>
            <span>{t('table.statusHeader')}</span>
            <span />
          </div>

          {changeRequests.map((cr) => {
            const isPendingCR = cr.status === ChangeRequestStatus.Pending;
            const isSelected = selectedIds.has(cr.id);

            return (
              <div
                key={cr.id}
                className="grid grid-cols-[auto_1fr_1fr_1fr_auto_auto] items-center gap-4 px-4 py-3 border-b last:border-b-0 hover:bg-muted/20 transition-colors"
              >
                {isPendingCR ? (
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleSelect(cr.id)}
                  />
                ) : (
                  <span />
                )}

                <span className="text-sm font-medium truncate">{cr.employeeName}</span>

                <span className="text-sm text-muted-foreground">
                  {cr.date ? formatDate(cr.date, i18n.language) : '—'}
                </span>

                <div className="min-w-0">
                  <p className="text-sm truncate">
                    <span className="text-muted-foreground">{cr.currentMeal?.name ?? t('noSelection')}</span>
                    <span className="mx-1.5 text-muted-foreground">→</span>
                    <span className="font-medium">{cr.requestedMeal?.name ?? '—'}</span>
                  </p>
                </div>

                <Badge variant={STATUS_VARIANTS[cr.status]} className="text-xs shrink-0">
                  {STATUS_LABELS[cr.status]}
                </Badge>

                {isPendingCR ? (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleSingleUpdate(cr, ChangeRequestStatus.Rejected)}
                      disabled={isPending}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30"
                      title={t('actions.reject')}
                    >
                      <X className="size-4" />
                    </button>
                    <button
                      onClick={() => handleSingleUpdate(cr, ChangeRequestStatus.Approved)}
                      disabled={isPending}
                      className="p-1.5 text-muted-foreground hover:text-primary transition-colors disabled:opacity-30"
                      title={t('actions.approve')}
                    >
                      <Check className="size-4" />
                    </button>
                  </div>
                ) : (
                  <span />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
