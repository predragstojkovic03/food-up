import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { DayChangeGroup } from '@/features/change-requests/application/group-change-requests';
import { ChangeRequestStatus } from '@food-up/shared';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EmployeeChangeBundle } from './employee-change-bundle';

const LOCALE: Record<string, string> = { en: 'en-US', sr: 'sr-Latn' };

interface DayChangeGroupSectionProps {
  group: DayChangeGroup;
  disabled: boolean;
  onApprove: (ids: string[]) => void;
  onReject: (ids: string[]) => void;
}

export function DayChangeGroupSection({ group, disabled, onApprove, onReject }: DayChangeGroupSectionProps) {
  const { t, i18n } = useTranslation('changeRequests');
  const [confirmRejectOpen, setConfirmRejectOpen] = useState(false);

  const pendingIds = group.employees
    .flatMap((employee) => employee.items)
    .filter((cr) => cr.status === ChangeRequestStatus.Pending)
    .map((cr) => cr.id);

  const dateLabel = group.date
    ? new Date(group.date).toLocaleDateString(LOCALE[i18n.language] ?? i18n.language, {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
      })
    : t('unknownDate');

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{dateLabel}</h2>

        {pendingIds.length > 1 && (
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="ghost" onClick={() => setConfirmRejectOpen(true)} disabled={disabled} className="gap-1">
              <X className="size-3.5" />
              {t('actions.rejectDay')}
            </Button>
            <Button size="sm" onClick={() => onApprove(pendingIds)} disabled={disabled} className="gap-1">
              <Check className="size-3.5" />
              {t('actions.approveDay')}
            </Button>
          </div>
        )}
      </div>

      <div className="border rounded-lg divide-y">
        {group.employees.map((employee) => (
          <EmployeeChangeBundle
            key={employee.employeeId}
            group={employee}
            disabled={disabled}
            onApprove={onApprove}
            onReject={onReject}
          />
        ))}
      </div>

      <AlertDialog open={confirmRejectOpen} onOpenChange={setConfirmRejectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmRejectDay.title', { date: dateLabel })}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmRejectDay.body', { count: pendingIds.length })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('confirmRejectDay.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => onReject(pendingIds)}>{t('confirmRejectDay.confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
