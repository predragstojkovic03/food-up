import { Badge } from '@/components/ui/badge';
import { ChangeRequestStatus, IRichChangeRequest } from '@food-up/shared';
import { Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const STATUS_VARIANTS: Record<ChangeRequestStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  [ChangeRequestStatus.Pending]: 'outline',
  [ChangeRequestStatus.Approved]: 'default',
  [ChangeRequestStatus.Rejected]: 'destructive',
  [ChangeRequestStatus.Revoked]: 'secondary',
};

interface ChangeRequestLineProps {
  changeRequest: IRichChangeRequest;
  disabled: boolean;
  onApprove: (ids: string[]) => void;
  onReject: (ids: string[]) => void;
}

export function ChangeRequestLine({ changeRequest: cr, disabled, onApprove, onReject }: ChangeRequestLineProps) {
  const { t } = useTranslation('changeRequests');
  const { t: tEmployees } = useTranslation('employees');

  const type = cr.currentMeal?.type ?? cr.requestedMeal?.type;
  const isAddition = cr.mealSelectionId === null;

  return (
    <div className="grid grid-cols-[6rem_1fr_auto] items-center gap-3 py-1.5">
      <span className="text-xs font-medium text-muted-foreground truncate">
        {type ? tEmployees(`mealTypes.${type}`) : '—'}
      </span>

      <p className="text-sm min-w-0 truncate">
        {cr.clearSelection ? (
          <>
            <span className="text-muted-foreground line-through">{cr.currentMeal?.name ?? t('noSelection')}</span>
            <span className="ml-2 text-destructive font-medium">{t('change.removed')}</span>
          </>
        ) : isAddition ? (
          <>
            <span className="text-primary font-medium">+ {cr.requestedMeal?.name ?? '—'}</span>
            {cr.newQuantity && cr.newQuantity > 1 && <span className="ml-1 text-muted-foreground">×{cr.newQuantity}</span>}
            <span className="ml-2 text-xs text-muted-foreground">{t('change.added')}</span>
          </>
        ) : (
          <>
            <span className="text-muted-foreground">{cr.currentMeal?.name ?? t('noSelection')}</span>
            <span className="mx-1.5 text-muted-foreground">→</span>
            <span className="font-medium">{cr.requestedMeal?.name ?? '—'}</span>
          </>
        )}
      </p>

      {cr.status === ChangeRequestStatus.Pending ? (
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={() => onReject([cr.id])}
            disabled={disabled}
            className="p-1.5 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30"
            title={t('actions.reject')}
          >
            <X className="size-4" />
          </button>
          <button
            onClick={() => onApprove([cr.id])}
            disabled={disabled}
            className="p-1.5 text-muted-foreground hover:text-primary transition-colors disabled:opacity-30"
            title={t('actions.approve')}
          >
            <Check className="size-4" />
          </button>
        </div>
      ) : (
        <Badge variant={STATUS_VARIANTS[cr.status]} className="text-xs shrink-0">
          {t(`status.${cr.status}`, { ns: 'common' })}
        </Badge>
      )}
    </div>
  );
}
