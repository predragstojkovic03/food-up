import { useState } from 'react';
import { format, startOfYear, subDays, subMonths } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { useTranslation } from 'react-i18next';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Preset = 'last30' | 'last3m' | 'last6m' | 'ytd' | 'custom';

interface DashboardDateRangePickerProps {
  from: Date;
  to: Date;
  onChange: (from: Date, to: Date) => void;
}

function isoDate(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

export function DashboardDateRangePicker({ from, to, onChange }: DashboardDateRangePickerProps) {
  const { t } = useTranslation('employees');
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange>({ from, to });

  const today = new Date();

  function applyPreset(preset: Exclude<Preset, 'custom'>) {
    if (preset === 'last30') onChange(subDays(today, 29), today);
    else if (preset === 'last3m') onChange(subMonths(today, 3), today);
    else if (preset === 'last6m') onChange(subMonths(today, 6), today);
    else onChange(startOfYear(today), today);
  }

  function handleApply() {
    if (draft.from && draft.to) {
      onChange(draft.from, draft.to);
      setOpen(false);
    }
  }

  const activePreset = (): Preset => {
    const endIsToday = isoDate(to) === isoDate(today);
    if (!endIsToday) return 'custom';
    if (isoDate(from) === isoDate(startOfYear(today))) return 'ytd';
    const diff = Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 29) return 'last30';
    if (diff >= 89 && diff <= 92) return 'last3m';
    if (diff >= 179 && diff <= 184) return 'last6m';
    return 'custom';
  };

  const current = activePreset();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {(['last30', 'last3m', 'last6m', 'ytd'] as const).map((p) => (
        <Button
          key={p}
          variant={current === p ? 'default' : 'outline'}
          size="sm"
          onClick={() => applyPreset(p)}
        >
          {t(`dashboard.dateRange.${p}`)}
        </Button>
      ))}

      <Popover open={open} onOpenChange={(o) => setOpen(o)}>
        <PopoverTrigger
          className={cn(
            'flex h-9 items-center gap-1.5 rounded-md border px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            current === 'custom'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background border-input text-foreground',
          )}
        >
          <CalendarIcon size={14} className="shrink-0" />
          {current === 'custom'
            ? `${format(from, 'dd MMM yyyy')} – ${format(to, 'dd MMM yyyy')}`
            : t('dashboard.dateRange.custom')}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={draft}
            onSelect={(range) => setDraft(range ?? { from: undefined, to: undefined })}
            numberOfMonths={2}
          />
          <div className="flex justify-end border-t p-2">
            <Button size="sm" disabled={!draft.from || !draft.to} onClick={handleApply}>
              {t('dashboard.dateRange.apply')}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
