import { Button } from '@/components/ui/button';
import { EmployeeChangeGroup } from '@/features/change-requests/application/group-change-requests';
import { ChangeRequestStatus } from '@food-up/shared';
import { Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ChangeRequestLine } from './change-request-line';

interface EmployeeChangeBundleProps {
  group: EmployeeChangeGroup;
  disabled: boolean;
  onApprove: (ids: string[]) => void;
  onReject: (ids: string[]) => void;
}

export function EmployeeChangeBundle({ group, disabled, onApprove, onReject }: EmployeeChangeBundleProps) {
  const { t } = useTranslation('changeRequests');
  const pendingIds = group.items.filter((cr) => cr.status === ChangeRequestStatus.Pending).map((cr) => cr.id);

  return (
    <div className="px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="text-sm font-semibold truncate">{group.employeeName}</span>
          <span className="text-xs text-muted-foreground shrink-0">
            {t('changesCount', { count: group.items.length })}
          </span>
        </div>

        {pendingIds.length > 1 && (
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="ghost" onClick={() => onReject(pendingIds)} disabled={disabled} className="h-7 gap-1">
              <X className="size-3.5" />
              {t('actions.rejectAll')}
            </Button>
            <Button size="sm" variant="outline" onClick={() => onApprove(pendingIds)} disabled={disabled} className="h-7 gap-1">
              <Check className="size-3.5" />
              {t('actions.approveAll')}
            </Button>
          </div>
        )}
      </div>

      <div className="pl-2">
        {group.items.map((cr) => (
          <ChangeRequestLine
            key={cr.id}
            changeRequest={cr}
            disabled={disabled}
            onApprove={onApprove}
            onReject={onReject}
          />
        ))}
      </div>
    </div>
  );
}
