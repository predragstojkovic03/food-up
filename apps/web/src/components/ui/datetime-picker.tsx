import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
  /** "YYYY-MM-DDTHH:mm" local datetime string, or "" for no selection */
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Date + time picker.
 * Stores and emits dates as local "YYYY-MM-DDTHH:mm" strings —
 * the same format produced by <input type="datetime-local">.
 */
export function DateTimePicker({
  value,
  onChange,
  placeholder = 'Pick date & time',
  disabled,
  className,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);

  const datePart = value ? value.split('T')[0] : '';
  const timePart = value.includes('T') ? (value.split('T')[1]?.slice(0, 5) ?? '') : '';

  const selectedDate = datePart ? new Date(datePart + 'T00:00:00') : undefined;

  function handleDateSelect(date: Date | undefined) {
    if (!date) return;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    onChange(`${y}-${m}-${d}T${timePart || '00:00'}`);
  }

  function handleTimeChange(time: string) {
    if (!datePart) return;
    onChange(`${datePart}T${time}`);
  }

  const displayText =
    selectedDate && timePart
      ? `${format(selectedDate, 'EEE, MMM d, yyyy')} at ${timePart}`
      : selectedDate
        ? format(selectedDate, 'EEE, MMM d, yyyy')
        : null;

  return (
    <Popover open={open} onOpenChange={(o) => setOpen(o)}>
      <PopoverTrigger
        disabled={disabled}
        className={cn(
          'flex h-9 w-full items-center justify-start gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          !displayText && 'text-muted-foreground',
          className,
        )}
      >
        <CalendarIcon size={14} className='shrink-0' />
        {displayText ?? placeholder}
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar mode='single' selected={selectedDate} onSelect={handleDateSelect} autoFocus />
        <div className='border-t p-3 space-y-2'>
          <Label className='text-xs text-muted-foreground'>Time</Label>
          <input
            type='time'
            value={timePart}
            onChange={(e) => handleTimeChange(e.target.value)}
            className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          />
        </div>
        <div className='flex justify-end px-3 pb-3'>
          <Button size='sm' onClick={() => setOpen(false)}>
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
