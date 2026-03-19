import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChangeRequestStatus,
  IRichChangeRequest,
  IMyMealSelectionResponse,
  IRelevantMealSelectionWindowResponse,
  MealType,
} from '@food-up/shared';
import { CalendarDays, ChevronDown, ChevronRight, Clock, PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateChangeRequestDrawer } from './create-change-request-drawer';

const TYPE_LABELS: Record<MealType, string> = {
  [MealType.Breakfast]: 'Breakfast',
  [MealType.Soup]: 'Soup',
  [MealType.Lunch]: 'Main',
  [MealType.Dinner]: 'Dinner',
  [MealType.Salad]: 'Salad',
  [MealType.Dessert]: 'Dessert',
};

const TYPE_ORDER: MealType[] = [
  MealType.Breakfast,
  MealType.Soup,
  MealType.Lunch,
  MealType.Dinner,
  MealType.Salad,
  MealType.Dessert,
];

const STATUS_LABELS: Record<ChangeRequestStatus, string> = {
  [ChangeRequestStatus.Pending]: 'Pending',
  [ChangeRequestStatus.Approved]: 'Approved',
  [ChangeRequestStatus.Rejected]: 'Rejected',
  [ChangeRequestStatus.Revoked]: 'Revoked',
};

const STATUS_VARIANTS: Record<ChangeRequestStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  [ChangeRequestStatus.Pending]: 'outline',
  [ChangeRequestStatus.Approved]: 'default',
  [ChangeRequestStatus.Rejected]: 'destructive',
  [ChangeRequestStatus.Revoked]: 'secondary',
};

interface WindowStatusCardProps {
  window: IRelevantMealSelectionWindowResponse;
  selections: IMyMealSelectionResponse[];
  changeRequests: IRichChangeRequest[];
}

function formatDeadline(endTime: string): string {
  const end = new Date(endTime);
  const now = new Date();
  const diffMs = end.getTime() - now.getTime();

  if (diffMs <= 0) return 'Deadline passed';

  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  const diffD = Math.floor(diffH / 24);

  if (diffD > 0) return `${diffD}d ${diffH % 24}h remaining`;
  if (diffH > 0) return `${diffH}h remaining`;
  const diffM = Math.floor(diffMs / (1000 * 60));
  return `${diffM}m remaining`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function WindowStatusCard({ window, selections, changeRequests }: WindowStatusCardProps) {
  const navigate = useNavigate();
  const [selectionsOpen, setSelectionsOpen] = useState(false);
  const [changeRequestsOpen, setChangeRequestsOpen] = useState(false);
  const [crSheetOpen, setCrSheetOpen] = useState(false);

  const submittedDates = new Set(selections.map((s) => s.date));
  const totalDays = window.targetDates.length;
  const completedDays = window.targetDates.filter((d) => submittedDates.has(d)).length;
  const progressPct = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;
  const allDone = completedDays === totalDays;

  const today = new Date().toISOString().split('T')[0];
  const hasFutureDays = window.targetDates.some((d) => d > today);
  const pendingCount = changeRequests.filter((cr) => cr.status === ChangeRequestStatus.Pending).length;

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base font-semibold">Meal Selection</CardTitle>
            {window.isActive ? (
              <Badge variant="default">Active</Badge>
            ) : (
              <Badge variant="secondary">Closed</Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Deadline */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-4 shrink-0" />
            <span>{formatDeadline(window.endTime)}</span>
          </div>

          {/* Target dates */}
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <CalendarDays className="size-4 shrink-0 mt-0.5" />
            <div className="flex flex-wrap gap-1">
              {window.targetDates.map((date) => {
                const done = submittedDates.has(date);
                return (
                  <span
                    key={date}
                    className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium border ${
                      done
                        ? 'bg-primary/10 border-primary/20 text-primary'
                        : 'bg-muted border-border text-muted-foreground'
                    }`}
                  >
                    {formatDate(date)}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{completedDays}/{totalDays} days</span>
            </div>
            <Progress value={progressPct} className="h-2" />
          </div>
        </CardContent>

        {window.isActive && (
          <CardFooter>
            <Button className="w-full" onClick={() => navigate(`/employee/select/${window.id}`)}>
              {allDone ? 'Edit selections' : completedDays > 0 ? 'Continue selecting' : 'Start selecting'}
              <ChevronRight className="size-4 ml-1" />
            </Button>
          </CardFooter>
        )}

        {!window.isActive && (
          <CardFooter className="flex-col items-stretch gap-0 pt-0 px-4 pb-4">
            <Separator className="mb-4" />

            {/* Your selections collapsible */}
            {selections.length > 0 && (
              <Collapsible open={selectionsOpen} onOpenChange={setSelectionsOpen}>
                <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium py-1">
                  Your selections
                  <ChevronDown className={`size-4 text-muted-foreground transition-transform ${selectionsOpen ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-3">
                  {window.targetDates.map((date) => {
                    const daySelections = selections.filter((s) => s.date === date && s.meal);
                    return (
                      <div key={date} className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">{formatDate(date)}</p>
                        {daySelections.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic">No order</p>
                        ) : (
                          TYPE_ORDER.filter((t) => daySelections.some((s) => s.meal?.type === t)).map((type) => {
                            const sel = daySelections.find((s) => s.meal?.type === type)!;
                            return (
                              <div key={type} className="flex items-center gap-2 text-sm">
                                <span className="text-xs text-muted-foreground w-16 shrink-0">{TYPE_LABELS[type]}</span>
                                <span className="flex-1 min-w-0 truncate">{sel.meal!.name}</span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Change requests collapsible */}
            {changeRequests.length > 0 && (
              <>
                <Separator className="my-3" />
                <Collapsible open={changeRequestsOpen} onOpenChange={setChangeRequestsOpen}>
                  <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium py-1">
                    <span className="flex items-center gap-2">
                      Change requests
                      {pendingCount > 0 && (
                        <Badge variant="outline" className="text-xs px-1.5 py-0">{pendingCount} pending</Badge>
                      )}
                    </span>
                    <ChevronDown className={`size-4 text-muted-foreground transition-transform ${changeRequestsOpen ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3 space-y-2">
                    {changeRequests.map((cr) => (
                      <div key={cr.id} className="flex items-start justify-between gap-2 rounded-lg border bg-muted/40 px-3 py-2">
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-xs font-medium">{cr.date ? formatDate(cr.date) : '—'}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {cr.currentMeal?.name ?? 'No selection'}
                            {' → '}
                            {cr.requestedMeal?.name ?? '—'}
                          </p>
                        </div>
                        <Badge variant={STATUS_VARIANTS[cr.status]} className="text-xs shrink-0">
                          {STATUS_LABELS[cr.status]}
                        </Badge>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </>
            )}

            {/* Request a change CTA */}
            {hasFutureDays && (
              <>
                <Separator className="my-3" />
                <Button variant="outline" className="w-full" onClick={() => setCrSheetOpen(true)}>
                  <PlusCircle className="size-4 mr-2" />
                  Request a change
                </Button>
              </>
            )}
          </CardFooter>
        )}
      </Card>

      <CreateChangeRequestDrawer
        window={window}
        selections={selections}
        open={crSheetOpen}
        onOpenChange={setCrSheetOpen}
      />
    </>
  );
}

export function WindowStatusCardSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-2 w-full" />
      </CardContent>
    </Card>
  );
}
