import { Progress } from '@/components/ui/progress';
import { ChevronLeft } from 'lucide-react';

interface FlowProgressProps {
  current: number; // 0-based
  total: number;
  onBack?: () => void;
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

export function FlowProgress({ current, total, date, onBack }: FlowHeaderProps) {
  const pct = total > 1 ? (current / (total - 1)) * 100 : 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="rounded-full p-1.5 hover:bg-muted transition-colors"
            aria-label="Previous day"
          >
            <ChevronLeft className="size-5" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">
            Day {current + 1} of {total}
          </p>
          <p className="font-semibold truncate">{formatDate(date)}</p>
        </div>
      </div>
      <Progress value={pct} className="h-1.5" />
    </div>
  );
}
