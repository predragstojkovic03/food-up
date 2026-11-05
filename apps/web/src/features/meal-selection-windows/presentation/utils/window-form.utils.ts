import { IMenuPeriodResponse } from '@food-up/shared';

/** Formats a date as YYYY-MM-DD in local time (the calendar day the user sees). */
export function dateToString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Work days to order for after a deadline: the rest of the current work week when the deadline
 * is Monday–Thursday, otherwise the full Monday–Friday of the next week.
 */
export function getNextWorkWeek(afterDate: Date): string[] {
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

/**
 * Without target dates a period is relevant while it hasn't ended; with target dates it must
 * cover at least one of them (the backend enforces that all dates are collectively covered).
 */
export function isMenuPeriodRelevant(
  menuPeriod: Pick<IMenuPeriodResponse, 'startDate' | 'endDate'>,
  targetDates: string[],
  today: string,
): boolean {
  if (targetDates.length === 0) return menuPeriod.endDate >= today;
  return targetDates.some((date) => menuPeriod.startDate <= date && menuPeriod.endDate >= date);
}

/**
 * Periods to offer in the create-window form: relevant ones plus any already selected (so they
 * can be deselected), ordered by start date and then supplier name.
 */
export function getVisibleMenuPeriods<T extends Pick<IMenuPeriodResponse, 'id' | 'startDate' | 'endDate' | 'supplierId'>>(
  menuPeriods: T[],
  opts: {
    targetDates: string[];
    selectedIds: string[];
    today: string;
    supplierNameById: Record<string, string>;
  },
): T[] {
  return menuPeriods
    .filter(
      (mp) => isMenuPeriodRelevant(mp, opts.targetDates, opts.today) || opts.selectedIds.includes(mp.id),
    )
    .sort(
      (a, b) =>
        a.startDate.localeCompare(b.startDate) ||
        (opts.supplierNameById[a.supplierId] ?? '').localeCompare(opts.supplierNameById[b.supplierId] ?? ''),
    );
}
