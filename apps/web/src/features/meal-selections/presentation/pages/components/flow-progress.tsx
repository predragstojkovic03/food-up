import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, X } from 'lucide-react';

interface FlowProgressProps {
  current: number; // 0-based
  total: number;
  onBack?: () => void;
  onExit?: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

interface FlowHeaderProps extends FlowProgressProps {
  date: string;
}

export function FlowProgress({ current, total, date, onBack, onExit }: FlowHeaderProps) {
  const pct = total > 1 ? (current / (total - 1)) * 100 : 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="Previous day" className="rounded-full shrink-0">
            <ChevronLeft className="size-5" />
          </Button>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">
            Day {current + 1} of {total}
          </p>
          <p className="font-semibold truncate">{formatDate(date)}</p>
        </div>
        {onExit && (
          <Button variant="ghost" size="icon" onClick={onExit} aria-label="Exit selection" className="rounded-full shrink-0">
            <X className="size-5" />
          </Button>
        )}
      </div>
      <Progress value={pct} className="h-1.5" />
    </div>
  );
}
