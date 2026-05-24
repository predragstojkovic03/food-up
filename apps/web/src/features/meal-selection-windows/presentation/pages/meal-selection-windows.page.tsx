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
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { formatRSD } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useServices } from '@/shared/infrastructure/di/service.context';
import {
  IExtraQuantity,
  IMailPreview,
  IMealSelectionResponse,
  IMealSelectionWindowResponse,
  IMenuPeriodResponse,
  IOrderSummarySend,
  ISupplierSendStatus,
  IWindowCostSummary,
  IWindowMenuItemResponse,
} from '@food-up/shared';
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CalendarRange,
  ChevronDown,
  ChevronRight,
  Download,
  Eye,
  Lock,
  LockOpen,
  Plus,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod/v3';
import { useTranslation } from 'react-i18next';

const WINDOWS_QUERY_KEY = ['meal-selection-windows', 'business'];

function formatDateWithWeekday(dateStr: string, locale: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });
}

function dateToString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getNextWorkWeek(afterDate: Date): string[] {
  const day = afterDate.getDay(); // 0=Sun, 1=Mon … 5=Fri, 6=Sat

  // How many work days remain in the current week after the deadline day:
  // Mon(1)→4, Tue(2)→3, Wed(3)→2, Thu(4)→1, Fri/Sat/Sun→0
  const remainingInWeek = day >= 1 && day <= 4 ? 5 - day : 0;

  if (remainingInWeek > 0) {
    return Array.from({ length: remainingInWeek }, (_, i) => {
      const d = new Date(afterDate);
      d.setDate(afterDate.getDate() + i + 1);
      d.setHours(0, 0, 0, 0);
      return dateToString(d);
    });
  }

  // Fri / Sat / Sun → full Mon–Fri of the next work week
  const daysToNextMon = day === 0 ? 1 : 8 - day; // Sun→1, Fri→3, Sat→2
  const monday = new Date(afterDate);
  monday.setDate(afterDate.getDate() + daysToNextMon);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return dateToString(d);
  });
}

export default function MealSelectionWindowsPage() {
  const { t, i18n } = useTranslation('meals');
  const locale = i18n.language === 'sr' ? 'sr-Latn-RS' : 'en-US';
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
  const [expandedWindowId, setExpandedWindowId] = useState<string | null>(null);

  function handleCreateWindow(data: Parameters<typeof mealSelectionWindowService.create>[0]) {
    createWindow.mutate(data, {
      onSuccess: () => setShowCreatePanel(false),
    });
  }

  const supplierNameById = Object.fromEntries(allSuppliers.map((s) => [s.id, s.name]));

  function getWindowStatus(w: IMealSelectionWindowResponse) {
    const expired = new Date(w.endTime) < new Date();
    if (expired) return { label: t('status.expired', { ns: 'common' }), cls: 'bg-muted text-muted-foreground' };
    if (w.isLocked) return { label: t('status.locked', { ns: 'common' }), cls: 'bg-warning/15 text-warning' };
    return { label: t('status.active', { ns: 'common' }), cls: 'bg-success/15 text-success' };
  }

  return (
    <div className='p-6'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold mb-1'>{t('windows.title')}</h1>
          <p className='text-muted-foreground text-sm'>
            {t('windows.subtitle')}
          </p>
        </div>
        <Button onClick={() => setShowCreatePanel(true)} className='gap-2'>
          <Plus size={16} />
          {t('windows.newButton')}
        </Button>
      </div>

      {showCreatePanel && (
        <CreateWindowPanel
          menuPeriods={allMenuPeriods}
          supplierNameById={supplierNameById}
          isPending={createWindow.isPending}
          isError={createWindow.isError}
          onSubmit={handleCreateWindow}
          onClose={() => setShowCreatePanel(false)}
        />
      )}

      <div className='border rounded-lg overflow-hidden'>
        <div className='grid grid-cols-[auto_1fr_auto_auto_auto_auto] text-xs font-medium text-muted-foreground bg-muted/40 px-4 py-2.5 border-b gap-4'>
          <span />
          <span>{t('windows.table.deadlineHeader')}</span>
          <span>{t('windows.table.targetDatesHeader')}</span>
          <span>{t('windows.table.menuPeriodsHeader')}</span>
          <span>{t('windows.table.statusHeader')}</span>
          <span />
        </div>

        {isLoading && (
          <>
            {[0, 1, 2].map((i) => (
              <div key={i} className='grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center px-4 py-3 border-b gap-4'>
                <Skeleton className='h-4 w-4' />
                <Skeleton className='h-4 w-56' />
                <Skeleton className='h-5 w-28 rounded' />
                <Skeleton className='h-4 w-16' />
                <Skeleton className='h-5 w-14 rounded-full' />
                <Skeleton className='h-6 w-12 rounded' />
              </div>
            ))}
          </>
        )}

        {!isLoading && windows.length === 0 && (
          <div className='px-4 py-8 text-center text-muted-foreground text-sm'>
            {t('windows.table.empty')}
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
                    {new Date(window.startTime).toLocaleString(locale)} – {new Date(window.endTime).toLocaleString(locale)}
                  </span>
                </div>

                <div className='flex flex-wrap gap-1 justify-end'>
                  {window.targetDates.map((d) => (
                    <span key={d} className='text-xs bg-muted px-1.5 py-0.5 rounded whitespace-nowrap'>
                      {formatDateWithWeekday(d, locale)}
                    </span>
                  ))}
                </div>

                <span className='text-xs text-muted-foreground text-right'>
                  {t('windows.table.periodCount', { count: window.menuPeriodIds.length })}
                </span>

                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${status.cls}`}>
                  {status.label}
                </span>

                <div className='flex items-center gap-1' onClick={(e) => e.stopPropagation()}>
                  {!isExpired && (
                    window.isLocked ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild disabled={isToggling}>
                          <button
                            className='p-1.5 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30'
                            title={t('windows.actions.unlock')}
                          >
                            <LockOpen size={15} />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('windows.unlockDialog.title')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('windows.unlockDialog.description')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel
                              onClick={() => updateWindow.mutate({ id: window.id, isLocked: false, notifyEmployees: false })}
                            >
                              {t('windows.unlockDialog.noNotify')}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => updateWindow.mutate({ id: window.id, isLocked: false, notifyEmployees: true })}
                            >
                              {t('windows.unlockDialog.yesNotify')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <button
                        onClick={() => updateWindow.mutate({ id: window.id, isLocked: true })}
                        disabled={isToggling}
                        className='p-1.5 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30'
                        title={t('windows.actions.lock')}
                      >
                        <Lock size={15} />
                      </button>
                    )
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
                        <AlertDialogTitle>{t('windows.deleteDialog.title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('windows.deleteDialog.description')}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('actions.cancel', { ns: 'common' })}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => removeWindow.mutate(window.id)}>
                          {t('actions.delete', { ns: 'common' })}
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
  const { t, i18n } = useTranslation('meals');
  const locale = i18n.language === 'sr' ? 'sr-Latn-RS' : 'en-US';
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
        {t('windows.detail.loading')}
      </div>
    );
  }

  if (menuItems.length === 0) {
    return (
      <div className='px-8 py-4 bg-muted/10 border-t text-sm text-muted-foreground'>
        {t('windows.detail.menuItems.empty')}
      </div>
    );
  }

  return (
    <div className='bg-muted/10 border-t px-8 py-4 space-y-5'>
      {targetDates.map((date) => {
        const items = itemsByDate[date] ?? [];

        return (
          <div key={date}>
            <h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2'>
              {new Date(date + 'T00:00:00').toLocaleDateString(locale, {
                weekday: 'long',
                day: 'numeric',
                month: 'numeric',
                year: 'numeric',
              })}
            </h3>

            {items.length === 0 ? (
              <p className='text-xs text-muted-foreground'>{t('windows.detail.menuItems.emptyForDate')}</p>
            ) : (
              <div className='grid grid-cols-[1fr_auto_auto_auto] text-xs text-muted-foreground font-medium border rounded-lg overflow-hidden'>
                <div className='contents'>
                  <span className='px-3 py-2 bg-muted/40 border-b'>{t('windows.detail.menuItems.mealHeader')}</span>
                  <span className='px-3 py-2 bg-muted/40 border-b'>{t('windows.detail.menuItems.descriptionHeader')}</span>
                  <span className='px-3 py-2 bg-muted/40 border-b text-right'>{t('windows.detail.menuItems.priceHeader')}</span>
                  <span className='px-3 py-2 bg-muted/40 border-b text-right'>{t('windows.detail.menuItems.selectionsHeader')}</span>
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
                        {formatRSD(item.price)}
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
            {t('windows.detail.orderSummary')}
          </h3>
          <div className='flex items-center gap-2'>
            {downloadXlsx.isError && (
              <span className='text-xs text-destructive'>{t('errors.downloadFailed', { ns: 'common' })}</span>
            )}
            <Button
              variant='outline'
              size='sm'
              onClick={() => downloadXlsx.mutate()}
              disabled={downloadXlsx.isPending}
              className='gap-1.5 text-xs'
            >
              <Download size={13} />
              {downloadXlsx.isPending ? t('actions.downloading', { ns: 'common' }) : t('windows.detail.download')}
            </Button>
          </div>
        </div>

        {isExpired && (
          <ExtraQuantitiesSection
            windowId={windowId}
            menuItems={menuItems}
            targetDates={targetDates}
          />
        )}

        {isExpired && <CostSummarySection windowId={windowId} />}

        {isExpired && <WindowReportsPanel windowId={windowId} />}
      </div>
    </div>
  );
}

// ─── Reports Panel (send-to-suppliers, expired windows only) ─────────────────

function WindowReportsPanel({ windowId }: { windowId: string }) {
  const { t } = useTranslation('meals');
  const { reportService } = useServices();
  const queryClient = useQueryClient();

  const SEND_STATUS_KEY = ['reports', 'send-status', windowId];
  const SENDS_KEY = ['reports', 'sends', windowId];

  const { data: statuses = [], isLoading } = useQuery<ISupplierSendStatus[]>({
    queryKey: SEND_STATUS_KEY,
    queryFn: () => reportService.getSendStatus(windowId),
  });

  const { data: sends = [] } = useQuery<IOrderSummarySend[]>({
    queryKey: SENDS_KEY,
    queryFn: () => reportService.getSends(windowId),
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  function toggleSupplier(supplierId: string) {
    setSelectedIds((prev) =>
      prev.includes(supplierId) ? prev.filter((id) => id !== supplierId) : [...prev, supplierId],
    );
  }

  function handleSendSuccess() {
    queryClient.invalidateQueries({ queryKey: SEND_STATUS_KEY });
    queryClient.invalidateQueries({ queryKey: SENDS_KEY });
    setSelectedIds([]);
    setDialogOpen(false);
  }

  const supplierNameById = Object.fromEntries(statuses.map((s) => [s.supplierId, s.supplierName]));

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
      <p className='text-xs text-muted-foreground'>{t('windows.detail.supplierTable.empty')}</p>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='space-y-3'>
        <h4 className='text-xs font-medium text-muted-foreground'>{t('windows.detail.sendToSuppliers')}</h4>

        <div className='border rounded-lg overflow-hidden'>
          <div className='grid grid-cols-[auto_1fr_1fr_1fr_auto] text-xs font-medium text-muted-foreground bg-muted/40 px-3 py-2 border-b gap-4'>
            <span />
            <span>{t('windows.detail.supplierTable.supplierHeader')}</span>
            <span>{t('windows.detail.supplierTable.emailHeader')}</span>
            <span>{t('windows.detail.supplierTable.lastSentHeader')}</span>
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
                    <span className='text-muted-foreground'>{t('status.noEmail', { ns: 'common' })}</span>
                  )}
                </span>

                <span className='text-sm'>
                  {status.lastSentAt ? (
                    new Date(status.lastSentAt).toLocaleString()
                  ) : (
                    <span className='text-muted-foreground'>{t('status.never', { ns: 'common' })}</span>
                  )}
                </span>

                <span>
                  {status.hasNewDataSinceLastSend && (
                    <span className='text-xs px-2 py-0.5 rounded-full bg-warning/15 text-warning font-medium whitespace-nowrap'>
                      {t('status.newData', { ns: 'common' })}
                    </span>
                  )}
                  {!status.canSend && !status.email && (
                    <span className='text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium whitespace-nowrap'>
                      {t('status.noEmail', { ns: 'common' })}
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>

        <Button
          size='sm'
          disabled={selectedIds.length === 0}
          onClick={() => setDialogOpen(true)}
          className='gap-1.5'
        >
          <Send size={13} />
          {t('windows.detail.sendButton', { count: selectedIds.length })}
        </Button>
      </div>

      <SentEmailsHistory sends={sends} />

      <SendPreviewDialog
        open={dialogOpen}
        windowId={windowId}
        supplierIds={selectedIds}
        supplierNameById={supplierNameById}
        onClose={() => setDialogOpen(false)}
        onSuccess={handleSendSuccess}
      />
    </div>
  );
}

// ─── Send Preview Dialog helpers ─────────────────────────────────────────────

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const LIGHT_DOC_WRAP = (body: string) =>
  `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="color-scheme" content="light"><style>html,body{background:#fff;color:#000;margin:0;padding:12px;font-family:Calibri,Arial,sans-serif;font-size:13px;}</style></head><body>${body}</body></html>`;

function buildPreviewDoc(baseHtml: string, currentIntroText: string): string {
  // The backend fragment always starts with <p>${introText}</p>.
  // Replace it with the current (possibly edited) intro text so the preview stays live.
  const updated = baseHtml.replace(/<p>[^<]*<\/p>/, `<p>${escapeHtml(currentIntroText)}</p>`);
  return LIGHT_DOC_WRAP(updated);
}

// ─── Send Preview Dialog ──────────────────────────────────────────────────────

interface SendPreviewDialogProps {
  open: boolean;
  windowId: string;
  supplierIds: string[];
  supplierNameById: Record<string, string>;
  onClose: () => void;
  onSuccess: () => void;
}

function SendPreviewDialog({
  open,
  windowId,
  supplierIds,
  supplierNameById,
  onClose,
  onSuccess,
}: SendPreviewDialogProps) {
  const { t } = useTranslation('meals');
  const { reportService } = useServices();
  const [activeId, setActiveId] = useState(supplierIds[0] ?? '');
  const [edits, setEdits] = useState<Record<string, { subject?: string; introText?: string }>>({});
  const [isSending, setIsSending] = useState(false);
  const [hasSendError, setHasSendError] = useState(false);

  useEffect(() => {
    if (open) {
      setActiveId(supplierIds[0] ?? '');
      setEdits({});
      setHasSendError(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const previewQueries = useQueries({
    queries: supplierIds.map((id) => ({
      queryKey: ['reports', 'preview', windowId, id],
      queryFn: () => reportService.getPreview(windowId, id),
      enabled: open && supplierIds.length > 0,
      staleTime: 0,
    })),
  }) as { data?: IMailPreview; isLoading: boolean; isError: boolean }[];

  function getField(supplierId: string, field: 'subject' | 'introText'): string {
    const idx = supplierIds.indexOf(supplierId);
    return edits[supplierId]?.[field] ?? previewQueries[idx]?.data?.[field] ?? '';
  }

  function setField(supplierId: string, field: 'subject' | 'introText', value: string) {
    setEdits((prev) => ({
      ...prev,
      [supplierId]: { ...prev[supplierId], [field]: value },
    }));
  }

  async function handleSendAll() {
    setIsSending(true);
    setHasSendError(false);
    try {
      await reportService.sendToSuppliers(
        windowId,
        supplierIds.map((id) => ({
          supplierId: id,
          subject: getField(id, 'subject'),
          introText: getField(id, 'introText'),
        })),
      );
      onSuccess();
    } catch {
      setHasSendError(true);
    } finally {
      setIsSending(false);
    }
  }

  const activeIdx = supplierIds.indexOf(activeId);
  const activeQuery = previewQueries[activeIdx];
  const allLoaded = previewQueries.length > 0 && previewQueries.every((q) => !q.isLoading);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className='w-[calc(100vw-2rem)] sm:max-w-5xl h-[85vh] flex flex-col p-0 gap-0'>
        <DialogHeader className='px-6 pt-5 pb-3 border-b shrink-0'>
          <DialogTitle>{t('windows.detail.previewDialog.title')}</DialogTitle>
        </DialogHeader>

        <div className='flex flex-1 overflow-hidden'>
          {/* Supplier list */}
          <div className='w-44 border-r flex flex-col shrink-0 overflow-y-auto'>
            {supplierIds.map((id, idx) => {
              const q = previewQueries[idx];
              return (
                <button
                  key={id}
                  type='button'
                  onClick={() => setActiveId(id)}
                  className={`text-left px-4 py-3 text-sm border-b last:border-b-0 transition-colors ${
                    id === activeId ? 'bg-muted font-medium' : 'hover:bg-muted/50'
                  }`}
                >
                  <div className='truncate'>{supplierNameById[id] ?? id}</div>
                  <div className='text-xs text-muted-foreground mt-0.5'>
                    {q.isLoading
                      ? t('windows.detail.previewDialog.loading')
                      : q.isError
                        ? t('windows.detail.previewDialog.error')
                        : t('windows.detail.previewDialog.ready')}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Preview panel */}
          <div className='flex-1 min-w-0 overflow-y-auto p-5 space-y-4'>
            {activeQuery?.isLoading && (
              <div className='space-y-3'>
                <Skeleton className='h-9 w-full' />
                <Skeleton className='h-20 w-full' />
                <Skeleton className='h-64 w-full' />
              </div>
            )}

            {activeQuery?.isError && (
              <p className='text-sm text-destructive'>Failed to load preview for this supplier.</p>
            )}

            {activeQuery?.data && !activeQuery.isLoading && (
              <>
                <div className='space-y-1.5'>
                  <Label htmlFor='preview-subject' className='text-xs font-medium'>{t('windows.detail.previewDialog.subjectLabel')}</Label>
                  <Input
                    id='preview-subject'
                    value={getField(activeId, 'subject')}
                    onChange={(e) => setField(activeId, 'subject', e.target.value)}
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor='preview-intro' className='text-xs font-medium'>{t('windows.detail.previewDialog.introLabel')}</Label>
                  <textarea
                    id='preview-intro'
                    rows={3}
                    value={getField(activeId, 'introText')}
                    onChange={(e) => setField(activeId, 'introText', e.target.value)}
                    className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none'
                  />
                </div>

                <Separator />

                <div>
                  <p className='text-xs font-medium text-muted-foreground mb-2'>{t('windows.detail.previewDialog.previewLabel')}</p>
                  <iframe
                    srcDoc={buildPreviewDoc(activeQuery.data.html, getField(activeId, 'introText'))}
                    className='w-full border rounded min-h-80'
                    title='Email preview'
                    sandbox='allow-same-origin'
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className='border-t px-6 py-3 flex items-center justify-between shrink-0'>
          <div>
            {hasSendError && <p className='text-sm text-destructive'>{t('windows.detail.sendError')}</p>}
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' onClick={onClose} disabled={isSending}>
              {t('actions.cancel', { ns: 'common' })}
            </Button>
            <Button
              onClick={handleSendAll}
              disabled={isSending || !allLoaded}
              className='gap-1.5'
            >
              <Send size={13} />
              {isSending
                ? t('windows.detail.previewDialog.sending')
                : t('windows.detail.previewDialog.sendAll', { count: supplierIds.length })}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Sent Emails History ──────────────────────────────────────────────────────

function SentEmailsHistory({ sends }: { sends: IOrderSummarySend[] }) {
  const { t, i18n } = useTranslation('meals');
  const locale = i18n.language === 'sr' ? 'sr-Latn-RS' : 'en-US';
  const [viewingSend, setViewingSend] = useState<IOrderSummarySend | null>(null);

  if (sends.length === 0) return null;

  return (
    <>
      <div>
        <h4 className='text-xs font-medium text-muted-foreground mb-2'>{t('windows.detail.sentHistory.title')}</h4>
        <div className='border rounded-lg overflow-hidden'>
          {sends.map((send) => (
            <div
              key={send.id}
              className='flex items-center px-4 py-2.5 border-b last:border-b-0 gap-4 hover:bg-muted/10 transition-colors'
            >
              <span className='text-sm font-medium flex-1'>{send.supplierName}</span>
              <span className='text-sm text-muted-foreground whitespace-nowrap'>
                {new Date(send.sentAt).toLocaleString(locale)}
              </span>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setViewingSend(send)}
                className='gap-1.5 h-7 text-xs'
              >
                <Eye size={12} />
                {t('windows.detail.sentHistory.viewButton')}
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={viewingSend !== null} onOpenChange={(o) => { if (!o) setViewingSend(null); }}>
        <DialogContent className='w-[calc(100vw-2rem)] sm:max-w-3xl h-[80vh] flex flex-col gap-3'>
          <DialogHeader>
            <DialogTitle>{viewingSend?.supplierName}</DialogTitle>
            <p className='text-sm text-muted-foreground'>{viewingSend?.subject}</p>
            <p className='text-xs text-muted-foreground'>
              {viewingSend ? new Date(viewingSend.sentAt).toLocaleString(locale) : ''}
            </p>
          </DialogHeader>
          <iframe
            srcDoc={viewingSend ? LIGHT_DOC_WRAP(viewingSend.htmlContent) : ''}
            className='flex-1 border rounded'
            title='Sent email'
            sandbox='allow-same-origin'
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Extra Quantities Section ─────────────────────────────────────────────────

interface ExtraQuantitiesSectionProps {
  windowId: string;
  menuItems: IWindowMenuItemResponse[];
  targetDates: string[];
}

function ExtraQuantitiesSection({ windowId, menuItems, targetDates }: ExtraQuantitiesSectionProps) {
  const { t, i18n } = useTranslation('meals');
  const locale = i18n.language === 'sr' ? 'sr-Latn-RS' : 'en-US';
  const { extraQuantityService } = useServices();
  const queryClient = useQueryClient();

  const EXTRAS_KEY = ['extra-quantities', windowId];
  const COST_KEY = ['reports', 'cost-summary', windowId];

  const { data: extras = [] } = useQuery<IExtraQuantity[]>({
    queryKey: EXTRAS_KEY,
    queryFn: () => extraQuantityService.getByWindow(windowId),
  });

  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(targetDates[0] ?? '');
  const [selectedMenuItemId, setSelectedMenuItemId] = useState('');
  const [guestName, setGuestName] = useState('');
  const [qty, setQty] = useState(1);

  const filteredItems = menuItems.filter((i) => i.day === selectedDate);
  const selectedMealItem = filteredItems.find((i) => i.id === selectedMenuItemId);

  function resetForm() {
    setShowForm(false);
    setSelectedDate(targetDates[0] ?? '');
    setSelectedMenuItemId('');
    setGuestName('');
    setQty(1);
  }

  function handleDateChange(date: string) {
    setSelectedDate(date);
    setSelectedMenuItemId('');
  }

  const addMutation = useMutation({
    mutationFn: () =>
      extraQuantityService.add({
        windowId,
        menuItemId: selectedMenuItemId,
        quantity: qty,
        guestName: guestName.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXTRAS_KEY });
      queryClient.invalidateQueries({ queryKey: COST_KEY });
      resetForm();
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => extraQuantityService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXTRAS_KEY });
      queryClient.invalidateQueries({ queryKey: COST_KEY });
    },
  });

  function formatDate(isoDate: string): string {
    return new Date(isoDate + 'T00:00:00').toLocaleDateString(locale);
  }

  function formatDateFull(isoDate: string): string {
    return new Date(isoDate + 'T00:00:00').toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
  }

  return (
    <div className='border rounded-lg overflow-hidden'>
      <div className='bg-muted/40 px-3 py-2 flex items-center justify-between border-b'>
        <span className='text-xs font-semibold'>
          {t('windows.detail.extras.title')}{' '}
          <span className='font-normal text-muted-foreground'>
            ({t('windows.detail.extras.subtitle')})
          </span>
        </span>
        {!showForm && (
          <Button variant='outline' size='sm' className='text-xs h-7' onClick={() => setShowForm(true)}>
            {t('windows.detail.extras.addRow')}
          </Button>
        )}
      </div>

      {extras.length > 0 && (
        <>
          <div className='grid grid-cols-[140px_1fr_50px_32px] gap-2 px-3 py-1.5 text-[10px] font-semibold text-muted-foreground bg-muted/20 border-b'>
            <span>
              {t('windows.detail.extras.guestNameHeader')}{' '}
              <span className='font-normal'>({t('windows.detail.extras.guestNameOptional')})</span>
            </span>
            <span>{t('windows.detail.extras.mealHeader')}</span>
            <span className='text-center'>{t('windows.detail.extras.qtyHeader')}</span>
            <span />
          </div>
          {extras.map((extra) => (
            <div
              key={extra.id}
              className='grid grid-cols-[140px_1fr_50px_32px] gap-2 px-3 py-2 items-center border-b last:border-b-0 text-xs'
            >
              {extra.guestName ? (
                <span className='text-foreground'>{extra.guestName}</span>
              ) : (
                <span className='text-muted-foreground italic'>—</span>
              )}
              <div>
                <div className='font-medium'>{menuItems.find((i) => i.id === extra.menuItemId)?.meal.name ?? '—'}</div>
                <div className='text-[10px] text-muted-foreground'>
                  {menuItems.find((i) => i.id === extra.menuItemId)?.supplierName ?? ''}{' '}
                  · {formatDate(menuItems.find((i) => i.id === extra.menuItemId)?.day ?? '')}
                </div>
              </div>
              <span className='text-center font-semibold'>{extra.quantity}</span>
              <button
                className='text-muted-foreground hover:text-destructive transition-colors text-base leading-none'
                onClick={() => removeMutation.mutate(extra.id)}
                disabled={removeMutation.isPending}
              >
                ×
              </button>
            </div>
          ))}
        </>
      )}

      {showForm && (
        <div className='bg-green-50 dark:bg-green-950/20 border-b border-green-200 dark:border-green-900 px-3 py-2.5'>
          <div className='text-[10px] font-semibold text-green-800 dark:text-green-300 mb-2'>
            {t('windows.detail.extras.newRowTitle')}
          </div>
          <div className='grid grid-cols-[140px_170px_1fr_60px_32px] gap-2 items-start'>
            <div>
              <div className='text-[9px] text-muted-foreground mb-1'>
                {t('windows.detail.extras.guestNameHeader')} ({t('windows.detail.extras.guestNameOptional')})
              </div>
              <Input
                className='h-7 text-xs'
                placeholder={t('windows.detail.extras.guestNamePlaceholder')}
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
              />
            </div>
            <div>
              <div className='text-[9px] text-muted-foreground mb-1'>{t('windows.detail.extras.dateLabel')}</div>
              <Select value={selectedDate} onValueChange={handleDateChange}>
                <SelectTrigger size='sm' className='w-full text-xs'>
                  <SelectValue>{selectedDate ? formatDateFull(selectedDate) : ''}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {targetDates.map((d) => (
                    <SelectItem key={d} value={d}>
                      {formatDateFull(d)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className='text-[9px] text-muted-foreground mb-1'>
                {t('windows.detail.extras.mealLabel')}{' '}
                <span className='text-muted-foreground/60'>
                  {t('windows.detail.extras.mealFilteredHint', { date: formatDate(selectedDate) })}
                </span>
              </div>
              <Select value={selectedMenuItemId} onValueChange={setSelectedMenuItemId}>
                <SelectTrigger size='sm' className='w-full text-xs'>
                  <SelectValue placeholder='—'>
                    {selectedMenuItemId && selectedMealItem
                      ? `${selectedMealItem.meal.name} — ${selectedMealItem.supplierName}`
                      : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {filteredItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.meal.name} — {item.supplierName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className='text-[9px] text-muted-foreground mb-1'>{t('windows.detail.extras.qtyLabel')}</div>
              <Input
                type='number'
                min={1}
                className='h-7 text-xs text-center'
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
            <div className='pt-4'>
              <button
                className='text-muted-foreground hover:text-destructive text-base leading-none'
                onClick={resetForm}
              >
                ×
              </button>
            </div>
          </div>
          <div className='flex gap-2 mt-2'>
            <Button
              size='sm'
              className='h-7 text-xs'
              disabled={!selectedMenuItemId || addMutation.isPending}
              onClick={() => addMutation.mutate()}
            >
              {t('windows.detail.extras.saveRow')}
            </Button>
            <Button variant='outline' size='sm' className='h-7 text-xs' onClick={resetForm}>
              {t('actions.cancel', { ns: 'common' })}
            </Button>
          </div>
        </div>
      )}

      <div className='px-3 py-2 text-[10px] text-muted-foreground italic'>
        {t('windows.detail.extras.hint')}
      </div>
    </div>
  );
}

// ─── Cost Summary Section ─────────────────────────────────────────────────────

function CostSummarySection({ windowId }: { windowId: string }) {
  const { t } = useTranslation('meals');
  const { reportService } = useServices();

  const { data: costSummary = [] } = useQuery<IWindowCostSummary[]>({
    queryKey: ['reports', 'cost-summary', windowId],
    queryFn: () => reportService.getCostSummary(windowId),
  });

  if (costSummary.length === 0) return null;

  const grandTotal = costSummary.reduce((sum, row) => sum + row.totalCost, 0);

  return (
    <div className='border rounded-lg overflow-hidden'>
      <div className='bg-muted/40 px-3 py-2 border-b'>
        <span className='text-xs font-semibold'>{t('windows.detail.costSummary.title')}</span>
        <span className='text-[10px] text-muted-foreground ml-2'>
          ({t('windows.detail.costSummary.subtitle')})
        </span>
      </div>
      <div className='px-3 py-2.5'>
        <div className='grid grid-cols-[1fr_auto] gap-x-6 gap-y-1 text-xs mb-2'>
          {costSummary.map((row) => (
            <React.Fragment key={row.supplierId}>
              <span className='text-foreground'>{row.supplierName}</span>
              <span className='font-semibold text-right'>
                {formatRSD(row.totalCost)}
              </span>
            </React.Fragment>
          ))}
        </div>
        <div className='border-t pt-2 grid grid-cols-[1fr_auto] gap-x-6 text-sm font-bold'>
          <span>{t('windows.detail.costSummary.total')}</span>
          <span>{formatRSD(grandTotal)}</span>
        </div>
        <div className='text-[10px] text-muted-foreground mt-1.5'>
          {t('windows.detail.costSummary.disclaimer')}
        </div>
      </div>
    </div>
  );
}

// ─── Create Panel ─────────────────────────────────────────────────────────────

const createWindowSchema = z.object({
  menuPeriodIds: z.array(z.string()).min(1, 'Select at least one menu period'),
  startTime: z.string().min(1, 'Opening date is required'),
  endTime: z.string().min(1, 'Deadline is required'),
  targetDates: z.array(z.string()).min(1, 'Select at least one date'),
  notifyOnDeadline: z.boolean().default(false),
});
type CreateWindowFormValues = z.infer<typeof createWindowSchema>;

interface CreateWindowPanelProps {
  menuPeriods: IMenuPeriodResponse[];
  supplierNameById: Record<string, string>;
  isPending: boolean;
  isError: boolean;
  onSubmit: (data: {
    menuPeriodIds: string[];
    startTime: string;
    endTime: string;
    targetDates: string[];
    notifyOnDeadline: boolean;
  }) => void;
  onClose: () => void;
}

function CreateWindowPanel({
  menuPeriods,
  supplierNameById,
  isPending,
  isError,
  onSubmit,
  onClose,
}: CreateWindowPanelProps) {
  const { t, i18n } = useTranslation('meals');
  const locale = i18n.language === 'sr' ? 'sr-Latn-RS' : 'en-US';
  const form = useForm<CreateWindowFormValues>({
    resolver: zodResolver(createWindowSchema),
    defaultValues: {
      menuPeriodIds: [],
      startTime: '',
      endTime: '',
      targetDates: [],
      notifyOnDeadline: false,
    },
  });

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [draftDates, setDraftDates] = useState<Date[]>([]);

  const watchedMenuPeriodIds = form.watch('menuPeriodIds');
  const watchedEndTime = form.watch('endTime');
  const watchedTargetDates = form.watch('targetDates');

  function toggleMenuPeriod(id: string) {
    const current = form.getValues('menuPeriodIds');
    form.setValue(
      'menuPeriodIds',
      current.includes(id) ? current.filter((p) => p !== id) : [...current, id],
      { shouldValidate: true },
    );
  }

  function openCalendar() {
    setDraftDates(watchedTargetDates.filter(Boolean).map((s) => new Date(s + 'T00:00:00')));
    setCalendarOpen(true);
  }

  function applyDraftDates() {
    form.setValue('targetDates', draftDates.map(dateToString).sort(), { shouldValidate: true });
    setCalendarOpen(false);
  }

  function removeDate(dateStr: string) {
    form.setValue(
      'targetDates',
      watchedTargetDates.filter((d) => d !== dateStr),
      { shouldValidate: true },
    );
  }

  function fillNextWorkWeek() {
    if (!watchedEndTime) return;
    form.setValue('targetDates', getNextWorkWeek(new Date(watchedEndTime)), { shouldValidate: true });
  }

  function handleSubmit(values: CreateWindowFormValues) {
    onSubmit({
      menuPeriodIds: values.menuPeriodIds,
      startTime: new Date(values.startTime).toISOString(),
      endTime: new Date(values.endTime).toISOString(),
      targetDates: values.targetDates.filter(Boolean),
      notifyOnDeadline: values.notifyOnDeadline,
    });
  }

  const activeDates = watchedTargetDates.filter(Boolean);

  return (
    <div className='mb-6 border rounded-lg p-5 bg-card'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='font-semibold'>{t('windows.createForm.title')}</h2>
        <button onClick={onClose} className='text-muted-foreground hover:text-foreground transition-colors'>
          <X size={16} />
        </button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-5'>
          {/* Menu Periods */}
          <FormField
            control={form.control}
            name='menuPeriodIds'
            render={() => {
              // Compute compatibility inline (extracted from IIFE)
              const lastTargetDate = activeDates.length > 0 ? [...activeDates].sort().at(-1)! : null;
              const deadlineDate = watchedEndTime ? watchedEndTime.split('T')[0] : null;
              const minRequiredEndDate = [lastTargetDate, deadlineDate].filter(Boolean).sort().at(-1) ?? null;
              const hasIncompatible = minRequiredEndDate
                ? menuPeriods.some((mp) => mp.endDate < minRequiredEndDate)
                : false;

              return (
                <FormItem>
                  <FormLabel>{t('windows.createForm.menuPeriodsSection')}</FormLabel>
                  {menuPeriods.length === 0 ? (
                    <p className='text-sm text-muted-foreground'>
                      {t('windows.createForm.menuPeriodsEmpty')}
                    </p>
                  ) : (
                    <>
                      <div className='flex flex-wrap gap-2'>
                        {menuPeriods.map((mp) => {
                          const selected = watchedMenuPeriodIds.includes(mp.id);
                          const compatible = minRequiredEndDate ? mp.endDate >= minRequiredEndDate : true;
                          return (
                            <button
                              key={mp.id}
                              type='button'
                              onClick={() => compatible ? toggleMenuPeriod(mp.id) : undefined}
                              disabled={!compatible && !selected}
                              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                                selected && compatible
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : selected && !compatible
                                    ? 'border-destructive text-destructive bg-destructive/10'
                                    : compatible
                                      ? 'bg-background text-foreground border-border hover:border-primary'
                                      : 'opacity-40 cursor-not-allowed bg-background text-foreground border-border'
                              }`}
                            >
                              {supplierNameById[mp.supplierId] ?? 'Supplier'} ·{' '}
                              {formatDateWithWeekday(mp.startDate, locale)} – {formatDateWithWeekday(mp.endDate, locale)}
                            </button>
                          );
                        })}
                      </div>
                      {hasIncompatible && (
                        <p className='text-xs text-muted-foreground mt-1.5'>
                          {t('windows.createForm.menuPeriodUnavailableHint')}
                        </p>
                      )}
                    </>
                  )}
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          {/* Start / End time */}
          <div className='grid grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='startTime'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('windows.createForm.opensLabel')}</FormLabel>
                  <DateTimePicker value={field.value} onChange={field.onChange} placeholder={t('windows.createForm.datePlaceholder')} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='endTime'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('windows.createForm.closesLabel')}</FormLabel>
                  <DateTimePicker value={field.value} onChange={field.onChange} placeholder={t('windows.createForm.datePlaceholder')} />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Target Dates */}
          <FormField
            control={form.control}
            name='targetDates'
            render={() => (
              <FormItem>
                <div className='flex items-center justify-between mb-2'>
                  <FormLabel>{t('windows.createForm.targetDatesLabel')}</FormLabel>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    disabled={!watchedEndTime}
                    onClick={fillNextWorkWeek}
                    className='gap-1.5 h-7 text-xs'
                  >
                    <CalendarRange size={12} />
                    {t('windows.createForm.nextWorkWeek')}
                  </Button>
                </div>
                <p className='text-xs text-muted-foreground mb-3'>{t('windows.createForm.targetDatesHint')}</p>

                {activeDates.length > 0 && (
                  <div className='flex flex-wrap gap-1.5 mb-3'>
                    {[...activeDates].sort().map((date) => (
                      <span
                        key={date}
                        className='inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20'
                      >
                        {formatDateWithWeekday(date, locale)}
                        <button
                          type='button'
                          onClick={() => removeDate(date)}
                          className='hover:text-destructive transition-colors'
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <Popover open={calendarOpen} onOpenChange={(o) => { if (o) openCalendar(); else setCalendarOpen(false); }}>
                  <PopoverTrigger
                    type='button'
                    className='text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1'
                  >
                    <Plus size={12} />
                    {activeDates.length > 0 ? t('windows.createForm.editDates') : t('windows.createForm.addDates')}
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='multiple'
                      selected={draftDates}
                      onSelect={(dates) => setDraftDates(dates ?? [])}
                    />
                    <div className='flex justify-end gap-2 border-t px-3 py-2'>
                      <Button type='button' variant='ghost' size='sm' onClick={() => setCalendarOpen(false)}>{t('actions.cancel', { ns: 'common' })}</Button>
                      <Button type='button' size='sm' onClick={applyDraftDates}>{t('actions.apply', { ns: 'common' })}</Button>
                    </div>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Notify on deadline */}
          <Controller
            control={form.control}
            name='notifyOnDeadline'
            render={({ field }) => (
              <div className='flex items-start gap-3'>
                <Checkbox
                  id='notify-on-deadline'
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                  className='mt-0.5'
                />
                <div>
                  <Label htmlFor='notify-on-deadline' className='font-normal cursor-pointer'>
                    {t('windows.createForm.autoSendLabel')}
                  </Label>
                  <p className='text-xs text-muted-foreground mt-0.5'>
                    {t('windows.createForm.autoSendHint')}
                  </p>
                </div>
              </div>
            )}
          />

          <div className='flex gap-3 items-center'>
            <Button type='submit' disabled={isPending}>
              {isPending ? t('actions.creating', { ns: 'common' }) : t('windows.createForm.title')}
            </Button>
            <p className='text-xs text-muted-foreground'>
              {t('windows.createForm.lockedHint')}
            </p>
          </div>

          {isError && (
            <p className='text-sm text-destructive'>{t('windows.createForm.error')}</p>
          )}
        </form>
      </Form>
    </div>
  );
}
