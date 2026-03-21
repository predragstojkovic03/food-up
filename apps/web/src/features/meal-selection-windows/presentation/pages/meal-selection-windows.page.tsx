import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useServices } from '@/shared/infrastructure/di/service.context';
import {
  IMealSelectionResponse,
  IMealSelectionWindowResponse,
  IMenuPeriodResponse,
  ISupplierSendStatus,
  IWindowMenuItemResponse,
} from '@food-up/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CalendarRange,
  ChevronDown,
  ChevronRight,
  Download,
  Lock,
  LockOpen,
  Plus,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import { useState } from 'react';

const WINDOWS_QUERY_KEY = ['meal-selection-windows', 'business'];

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatDateWithWeekday(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${WEEKDAYS[d.getDay()]}, ${d.toLocaleDateString()}`;
}

export default function MealSelectionWindowsPage() {
  const { mealSelectionWindowService, supplierService, menuPeriodService } = useServices();
  const queryClient = useQueryClient();

  const { data: windows = [], isLoading } = useQuery({
    queryKey: WINDOWS_QUERY_KEY,
    queryFn: () => mealSelectionWindowService.getForMyBusiness(),
  });

  const { data: managedSuppliers = [] } = useQuery({
    queryKey: ['suppliers', 'in-house'],
    queryFn: () => supplierService.getManagedByBusiness(),
  });

  const { data: partnerSuppliers = [] } = useQuery({
    queryKey: ['suppliers', 'partners'],
    queryFn: () => supplierService.getPartnersByBusiness(),
  });

  const allSuppliers = [...managedSuppliers, ...partnerSuppliers];

  const { data: allMenuPeriods = [] } = useQuery<IMenuPeriodResponse[]>({
    queryKey: ['menu-periods', 'all-suppliers', allSuppliers.map((s) => s.id).join(',')],
    queryFn: async () => {
      if (allSuppliers.length === 0) return [];
      const results = await Promise.all(
        allSuppliers.map((s) => menuPeriodService.getBySupplier(s.id)),
      );
      return results.flat();
    },
    enabled: allSuppliers.length > 0,
  });

  const createWindow = useMutation({
    mutationFn: mealSelectionWindowService.create.bind(mealSelectionWindowService),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: WINDOWS_QUERY_KEY }),
  });

  const updateWindow = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Parameters<typeof mealSelectionWindowService.update>[1]) =>
      mealSelectionWindowService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: WINDOWS_QUERY_KEY }),
  });

  const removeWindow = useMutation({
    mutationFn: (id: string) => mealSelectionWindowService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: WINDOWS_QUERY_KEY }),
  });

  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [selectedMenuPeriodIds, setSelectedMenuPeriodIds] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [targetDates, setTargetDates] = useState<string[]>(['']);
  const [notifyOnDeadline, setNotifyOnDeadline] = useState(false);
  const [expandedWindowId, setExpandedWindowId] = useState<string | null>(null);

  function toggleMenuPeriod(id: string) {
    setSelectedMenuPeriodIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  function resetForm() {
    setSelectedMenuPeriodIds([]);
    setStartTime('');
    setEndTime('');
    setTargetDates(['']);
    setNotifyOnDeadline(false);
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    createWindow.mutate(
      {
        menuPeriodIds: selectedMenuPeriodIds,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        targetDates: targetDates.filter(Boolean),
        notifyOnDeadline,
      },
      { onSuccess: () => { resetForm(); setShowCreatePanel(false); } },
    );
  }

  const supplierNameById = Object.fromEntries(allSuppliers.map((s) => [s.id, s.name]));

  function getWindowStatus(w: IMealSelectionWindowResponse) {
    const expired = new Date(w.endTime) < new Date();
    if (expired) return { label: 'Expired', cls: 'bg-muted text-muted-foreground' };
    if (w.isLocked) return { label: 'Locked', cls: 'bg-yellow-100 text-yellow-700' };
    return { label: 'Active', cls: 'bg-green-100 text-green-700' };
  }

  return (
    <div className='p-6'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold mb-1'>Meal Selection Windows</h1>
          <p className='text-muted-foreground text-sm'>
            Create time windows for employees to select their meals
          </p>
        </div>
        <Button onClick={() => setShowCreatePanel(true)} className='gap-2'>
          <Plus size={16} />
          New Window
        </Button>
      </div>

      {showCreatePanel && (
        <CreateWindowPanel
          menuPeriods={allMenuPeriods}
          supplierNameById={supplierNameById}
          selectedMenuPeriodIds={selectedMenuPeriodIds}
          startTime={startTime}
          endTime={endTime}
          targetDates={targetDates}
          notifyOnDeadline={notifyOnDeadline}
          isPending={createWindow.isPending}
          isError={createWindow.isError}
          onToggleMenuPeriod={toggleMenuPeriod}
          onStartTimeChange={setStartTime}
          onEndTimeChange={setEndTime}
          onTargetDatesChange={setTargetDates}
          onNotifyOnDeadlineChange={setNotifyOnDeadline}
          onSubmit={handleCreate}
          onClose={() => { setShowCreatePanel(false); resetForm(); }}
        />
      )}

      <div className='border rounded-lg overflow-hidden'>
        <div className='grid grid-cols-[auto_1fr_auto_auto_auto_auto] text-xs font-medium text-muted-foreground bg-muted/40 px-4 py-2.5 border-b gap-4'>
          <span />
          <span>Selection Deadline</span>
          <span>Target Dates</span>
          <span>Menu Periods</span>
          <span>Status</span>
          <span />
        </div>

        {isLoading && (
          <div className='px-4 py-8 text-center text-muted-foreground text-sm'>Loading windows…</div>
        )}

        {!isLoading && windows.length === 0 && (
          <div className='px-4 py-8 text-center text-muted-foreground text-sm'>
            No meal selection windows yet.{' '}
            <button onClick={() => setShowCreatePanel(true)} className='underline hover:text-foreground transition-colors'>
              Create one
            </button>{' '}
            to let employees start selecting meals.
          </div>
        )}

        {windows.map((window) => {
          const status = getWindowStatus(window);
          const isExpired = new Date(window.endTime) < new Date();
          const isExpanded = expandedWindowId === window.id;
          const isToggling = updateWindow.isPending && updateWindow.variables?.id === window.id;

          return (
            <div key={window.id} className='border-b last:border-b-0'>
              <div
                className='grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center px-4 py-3 gap-4 cursor-pointer hover:bg-muted/20 transition-colors'
                onClick={() => setExpandedWindowId(isExpanded ? null : window.id)}
              >
                <span className='text-muted-foreground'>
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </span>

                <div className='flex items-center gap-2'>
                  <CalendarRange size={14} className='text-muted-foreground shrink-0' />
                  <span className='text-sm font-medium'>
                    {new Date(window.startTime).toLocaleString()} – {new Date(window.endTime).toLocaleString()}
                  </span>
                </div>

                <div className='flex flex-wrap gap-1 justify-end'>
                  {window.targetDates.map((d) => (
                    <span key={d} className='text-xs bg-muted px-1.5 py-0.5 rounded whitespace-nowrap'>
                      {formatDateWithWeekday(d)}
                    </span>
                  ))}
                </div>

                <span className='text-xs text-muted-foreground text-right'>
                  {window.menuPeriodIds.length} period{window.menuPeriodIds.length !== 1 ? 's' : ''}
                </span>

                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${status.cls}`}>
                  {status.label}
                </span>

                <div className='flex items-center gap-1' onClick={(e) => e.stopPropagation()}>
                  {!isExpired && (
                    <button
                      onClick={() => updateWindow.mutate({ id: window.id, isLocked: !window.isLocked })}
                      disabled={isToggling}
                      className='p-1.5 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30'
                      title={window.isLocked ? 'Unlock — allow employees to select' : 'Lock — prevent new selections'}
                    >
                      {window.isLocked ? <LockOpen size={15} /> : <Lock size={15} />}
                    </button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger
                      disabled={removeWindow.isPending && removeWindow.variables === window.id}
                      className='p-1.5 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30'
                      title='Delete window'
                    >
                      <Trash2 size={15} />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete meal selection window</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the window and all employee selections within it.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => removeWindow.mutate(window.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              {isExpanded && (
                <WindowDetails
                  windowId={window.id}
                  endTime={window.endTime}
                  targetDates={window.targetDates}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Expanded Details ────────────────────────────────────────────────────────

interface WindowDetailsProps {
  windowId: string;
  endTime: string;
  targetDates: string[];
}

function WindowDetails({ windowId, endTime, targetDates }: WindowDetailsProps) {
  const { mealSelectionWindowService, mealSelectionService, reportService } = useServices();
  const isExpired = new Date(endTime) < new Date();

  const { data: menuItems = [], isLoading: loadingItems } = useQuery<IWindowMenuItemResponse[]>({
    queryKey: ['meal-selection-windows', windowId, 'menu-items'],
    queryFn: () => mealSelectionWindowService.getMenuItems(windowId),
  });

  const { data: selections = [], isLoading: loadingSelections } = useQuery<IMealSelectionResponse[]>({
    queryKey: ['meal-selections', 'window', windowId],
    queryFn: () => mealSelectionService.getByWindow(windowId),
  });

  const downloadXlsx = useMutation({
    mutationFn: () => reportService.downloadXlsx(windowId),
  });

  const isLoading = loadingItems || loadingSelections;

  const quantityByMenuItemId = selections.reduce<Record<string, number>>((acc, s) => {
    if (s.menuItemId) acc[s.menuItemId] = (acc[s.menuItemId] ?? 0) + (s.quantity ?? 1);
    return acc;
  }, {});

  const itemsByDate = targetDates.reduce<Record<string, IWindowMenuItemResponse[]>>((acc, date) => {
    acc[date] = menuItems.filter((item) => item.day === date);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className='px-8 py-4 bg-muted/10 border-t text-sm text-muted-foreground'>
        Loading details…
      </div>
    );
  }

  if (menuItems.length === 0) {
    return (
      <div className='px-8 py-4 bg-muted/10 border-t text-sm text-muted-foreground'>
        No menu items found for this window's menu periods.
      </div>
    );
  }

  return (
    <div className='bg-muted/10 border-t px-8 py-4 space-y-5'>
      {targetDates.map((date) => {
        const items = itemsByDate[date] ?? [];
        const weekday = WEEKDAYS[new Date(date + 'T00:00:00').getDay()];

        return (
          <div key={date}>
            <h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2'>
              {weekday} — {new Date(date + 'T00:00:00').toLocaleDateString()}
            </h3>

            {items.length === 0 ? (
              <p className='text-xs text-muted-foreground'>No menu items for this date.</p>
            ) : (
              <div className='grid grid-cols-[1fr_auto_auto_auto] text-xs text-muted-foreground font-medium border rounded-lg overflow-hidden'>
                <div className='contents'>
                  <span className='px-3 py-2 bg-muted/40 border-b'>Meal</span>
                  <span className='px-3 py-2 bg-muted/40 border-b'>Description</span>
                  <span className='px-3 py-2 bg-muted/40 border-b text-right'>Price</span>
                  <span className='px-3 py-2 bg-muted/40 border-b text-right'>Selections</span>
                </div>
                {items.map((item) => {
                  const qty = quantityByMenuItemId[item.id] ?? 0;
                  return (
                    <div key={item.id} className='contents'>
                      <span className='px-3 py-2.5 text-foreground font-medium border-b last:border-b-0'>
                        {item.meal.name}
                      </span>
                      <span className='px-3 py-2.5 text-muted-foreground border-b last:border-b-0'>
                        {item.meal.description || '—'}
                      </span>
                      <span className='px-3 py-2.5 text-right border-b last:border-b-0'>
                        {item.price != null ? `$${item.price.toFixed(2)}` : '—'}
                      </span>
                      <span className={`px-3 py-2.5 text-right font-medium border-b last:border-b-0 ${qty > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {qty > 0 ? qty : '—'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <Separator />

      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-wide'>
            Order Summary
          </h3>
          <div className='flex items-center gap-2'>
            {downloadXlsx.isError && (
              <span className='text-xs text-destructive'>Download failed.</span>
            )}
            <Button
              variant='outline'
              size='sm'
              onClick={() => downloadXlsx.mutate()}
              disabled={downloadXlsx.isPending}
              className='gap-1.5 text-xs'
            >
              <Download size={13} />
              {downloadXlsx.isPending ? 'Downloading…' : 'Download XLSX'}
            </Button>
          </div>
        </div>

        {isExpired && <WindowReportsPanel windowId={windowId} />}
      </div>
    </div>
  );
}

// ─── Reports Panel (send-to-suppliers, expired windows only) ─────────────────

function WindowReportsPanel({ windowId }: { windowId: string }) {
  const { reportService } = useServices();
  const queryClient = useQueryClient();

  const SEND_STATUS_KEY = ['reports', 'send-status', windowId];

  const { data: statuses = [], isLoading } = useQuery<ISupplierSendStatus[]>({
    queryKey: SEND_STATUS_KEY,
    queryFn: () => reportService.getSendStatus(windowId),
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const sendMutation = useMutation({
    mutationFn: (supplierIds: string[]) =>
      reportService.sendToSuppliers(windowId, supplierIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SEND_STATUS_KEY });
      setSelectedIds([]);
    },
  });

  function toggleSupplier(supplierId: string) {
    setSelectedIds((prev) =>
      prev.includes(supplierId) ? prev.filter((id) => id !== supplierId) : [...prev, supplierId],
    );
  }

  if (isLoading) {
    return (
      <div className='space-y-2'>
        {[1, 2, 3].map((i) => (
          <div key={i} className='grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-4 items-center'>
            <Skeleton className='h-4 w-4 rounded' />
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-4 w-40' />
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-5 w-16 rounded-full' />
          </div>
        ))}
      </div>
    );
  }

  if (statuses.length === 0) {
    return (
      <p className='text-xs text-muted-foreground'>No supplier data for this window.</p>
    );
  }

  return (
    <div className='space-y-3'>
      <h4 className='text-xs font-medium text-muted-foreground'>Send to Suppliers</h4>

      <div className='border rounded-lg overflow-hidden'>
        <div className='grid grid-cols-[auto_1fr_1fr_1fr_auto] text-xs font-medium text-muted-foreground bg-muted/40 px-3 py-2 border-b gap-4'>
          <span />
          <span>Supplier</span>
          <span>Email</span>
          <span>Last sent</span>
          <span />
        </div>

        {statuses.map((status) => {
          const isChecked = selectedIds.includes(status.supplierId);
          return (
            <div
              key={status.supplierId}
              className='grid grid-cols-[auto_1fr_1fr_1fr_auto] items-center px-3 py-2.5 border-b last:border-b-0 gap-4 hover:bg-muted/10 transition-colors'
            >
              <Checkbox
                checked={isChecked}
                disabled={!status.canSend}
                onCheckedChange={() => toggleSupplier(status.supplierId)}
              />

              <span className='text-sm font-medium'>{status.supplierName}</span>

              <span className='text-sm'>
                {status.email ?? (
                  <span className='text-muted-foreground'>No email</span>
                )}
              </span>

              <span className='text-sm'>
                {status.lastSentAt ? (
                  new Date(status.lastSentAt).toLocaleString()
                ) : (
                  <span className='text-muted-foreground'>Never</span>
                )}
              </span>

              <span>
                {status.hasNewDataSinceLastSend && (
                  <span className='text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium whitespace-nowrap'>
                    New data
                  </span>
                )}
                {!status.canSend && !status.email && (
                  <span className='text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium whitespace-nowrap'>
                    No email
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      <div className='flex items-center gap-3'>
        <Button
          size='sm'
          disabled={selectedIds.length === 0 || sendMutation.isPending}
          onClick={() => sendMutation.mutate(selectedIds)}
          className='gap-1.5'
        >
          <Send size={13} />
          {sendMutation.isPending
            ? 'Sending…'
            : `Send to ${selectedIds.length} supplier${selectedIds.length !== 1 ? 's' : ''}`}
        </Button>

        {sendMutation.isError && (
          <p className='text-sm text-destructive'>Failed to send. Please try again.</p>
        )}
      </div>
    </div>
  );
}

// ─── Create Panel ─────────────────────────────────────────────────────────────

interface CreateWindowPanelProps {
  menuPeriods: IMenuPeriodResponse[];
  supplierNameById: Record<string, string>;
  selectedMenuPeriodIds: string[];
  startTime: string;
  endTime: string;
  targetDates: string[];
  notifyOnDeadline: boolean;
  isPending: boolean;
  isError: boolean;
  onToggleMenuPeriod: (id: string) => void;
  onStartTimeChange: (v: string) => void;
  onEndTimeChange: (v: string) => void;
  onTargetDatesChange: (dates: string[]) => void;
  onNotifyOnDeadlineChange: (v: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

function CreateWindowPanel({
  menuPeriods,
  supplierNameById,
  selectedMenuPeriodIds,
  startTime,
  endTime,
  targetDates,
  notifyOnDeadline,
  isPending,
  isError,
  onToggleMenuPeriod,
  onStartTimeChange,
  onEndTimeChange,
  onTargetDatesChange,
  onNotifyOnDeadlineChange,
  onSubmit,
  onClose,
}: CreateWindowPanelProps) {
  function setDate(index: number, value: string) {
    const next = [...targetDates];
    next[index] = value;
    onTargetDatesChange(next);
  }

  function removeDate(index: number) {
    onTargetDatesChange(targetDates.filter((_, i) => i !== index));
  }

  return (
    <div className='mb-6 border rounded-lg p-5 bg-card'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='font-semibold'>Create Meal Selection Window</h2>
        <button onClick={onClose} className='text-muted-foreground hover:text-foreground transition-colors'>
          <X size={16} />
        </button>
      </div>

      <form onSubmit={onSubmit} className='space-y-5'>
        <div>
          <Label className='mb-2 block'>Menu Periods</Label>
          {menuPeriods.length === 0 ? (
            <p className='text-sm text-muted-foreground'>
              No menu periods available. Create menu periods under each supplier first.
            </p>
          ) : (
            <div className='flex flex-wrap gap-2'>
              {menuPeriods.map((mp) => {
                const selected = selectedMenuPeriodIds.includes(mp.id);
                return (
                  <button
                    key={mp.id}
                    type='button'
                    onClick={() => onToggleMenuPeriod(mp.id)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      selected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-foreground border-border hover:border-primary'
                    }`}
                  >
                    {supplierNameById[mp.supplierId] ?? 'Supplier'} ·{' '}
                    {formatDateWithWeekday(mp.startDate)} – {formatDateWithWeekday(mp.endDate)}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <Label htmlFor='start-time' className='mb-1.5 block'>Selection Opens</Label>
            <Input id='start-time' type='datetime-local' value={startTime} onChange={(e) => onStartTimeChange(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor='end-time' className='mb-1.5 block'>Selection Closes (Deadline)</Label>
            <Input id='end-time' type='datetime-local' value={endTime} onChange={(e) => onEndTimeChange(e.target.value)} required />
          </div>
        </div>

        <div>
          <Label className='mb-2 block'>Target Dates</Label>
          <p className='text-xs text-muted-foreground mb-2'>The meal dates employees are selecting for.</p>
          <div className='space-y-2'>
            {targetDates.map((date, index) => (
              <div key={index} className='flex gap-2 items-center'>
                <Input
                  type='date'
                  value={date}
                  onChange={(e) => setDate(index, e.target.value)}
                  required
                  className='w-48'
                />
                {date && (
                  <span className='text-xs text-muted-foreground'>
                    {WEEKDAYS[new Date(date + 'T00:00:00').getDay()]}
                  </span>
                )}
                {targetDates.length > 1 && (
                  <button type='button' onClick={() => removeDate(index)} className='text-muted-foreground hover:text-destructive transition-colors'>
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
            <button
              type='button'
              onClick={() => onTargetDatesChange([...targetDates, ''])}
              className='text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1'
            >
              <Plus size={12} />
              Add date
            </button>
          </div>
        </div>

        <div className='flex items-start gap-3'>
          <Checkbox
            id='notify-on-deadline'
            checked={notifyOnDeadline}
            onCheckedChange={(checked) => onNotifyOnDeadlineChange(checked === true)}
            className='mt-0.5'
          />
          <div>
            <Label htmlFor='notify-on-deadline' className='font-normal cursor-pointer'>
              Auto-send order summary to suppliers when the deadline passes
            </Label>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Only sends if no change requests have been approved.
            </p>
          </div>
        </div>

        <div className='flex gap-3 items-center'>
          <Button type='submit' disabled={isPending || selectedMenuPeriodIds.length === 0}>
            {isPending ? 'Creating…' : 'Create Window'}
          </Button>
          <p className='text-xs text-muted-foreground'>
            Windows are locked by default. Unlock when ready for employees.
          </p>
        </div>

        {isError && (
          <p className='text-sm text-destructive'>Failed to create window. Please try again.</p>
        )}
      </form>
    </div>
  );
}
