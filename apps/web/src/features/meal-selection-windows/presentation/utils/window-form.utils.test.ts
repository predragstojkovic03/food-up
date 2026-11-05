import { describe, expect, it } from 'vitest';
import { dateToString, getNextWorkWeek, getVisibleMenuPeriods, isMenuPeriodRelevant } from './window-form.utils';

// Local-time constructor: months are 0-based (9 = October)
const at = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h);

describe('dateToString', () => {
  it('formats the local calendar day, even late in the evening', () => {
    expect(dateToString(at(2026, 10, 23, 23))).toBe('2026-10-23');
    expect(dateToString(at(2026, 1, 5, 0))).toBe('2026-01-05');
  });
});

describe('getNextWorkWeek', () => {
  it('returns the rest of the week after a Monday–Thursday deadline', () => {
    expect(getNextWorkWeek(at(2026, 10, 19))).toEqual(['2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23']);
    expect(getNextWorkWeek(at(2026, 10, 21))).toEqual(['2026-10-22', '2026-10-23']);
    expect(getNextWorkWeek(at(2026, 10, 22, 23))).toEqual(['2026-10-23']);
  });

  it('returns the full next week after a Friday, Saturday or Sunday deadline', () => {
    const nextWeek = ['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30'];
    expect(getNextWorkWeek(at(2026, 10, 23))).toEqual(nextWeek);
    expect(getNextWorkWeek(at(2026, 10, 24))).toEqual(nextWeek);
    expect(getNextWorkWeek(at(2026, 10, 25))).toEqual(nextWeek);
  });

  it('crosses month and year boundaries', () => {
    expect(getNextWorkWeek(at(2026, 10, 30))).toEqual(['2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06']);
    expect(getNextWorkWeek(at(2026, 12, 30))).toEqual(['2026-12-31', '2027-01-01']);
  });
});

describe('menu periods in the create-window form', () => {
  const today = '2026-10-23';
  const period = (id: string, startDate: string, endDate: string, supplierId = 'sup-a') => ({ id, startDate, endDate, supplierId });
  const ended = period('ended', '2026-10-12', '2026-10-16');
  const endsToday = period('ends-today', '2026-10-19', '2026-10-23');
  const nextWeek = period('next-week', '2026-10-26', '2026-10-30');
  const later = period('later', '2026-11-09', '2026-11-13');
  const all = [later, ended, nextWeek, endsToday];

  describe('isMenuPeriodRelevant', () => {
    it("before target dates are picked, keeps periods that haven't ended (including today)", () => {
      expect(isMenuPeriodRelevant(ended, [], today)).toBe(false);
      expect(isMenuPeriodRelevant(endsToday, [], today)).toBe(true);
      expect(isMenuPeriodRelevant(nextWeek, [], today)).toBe(true);
    });

    it('with target dates, keeps only periods covering at least one of them', () => {
      expect(isMenuPeriodRelevant(nextWeek, ['2026-10-26'], today)).toBe(true);
      expect(isMenuPeriodRelevant(nextWeek, ['2026-10-30', '2026-11-10'], today)).toBe(true);
      expect(isMenuPeriodRelevant(later, ['2026-10-26'], today)).toBe(false);
    });
  });

  describe('getVisibleMenuPeriods', () => {
    const visible = (targetDates: string[], selectedIds: string[] = [], supplierNameById = {}) =>
      getVisibleMenuPeriods(all, { targetDates, selectedIds, today, supplierNameById }).map((p) => p.id);

    it('hides past periods and orders the rest by start date', () => {
      expect(visible([])).toEqual(['ends-today', 'next-week', 'later']);
    });

    it('narrows to periods covering the chosen dates', () => {
      expect(visible(['2026-10-27'])).toEqual(['next-week']);
      expect(visible(['2026-10-27', '2026-11-10'])).toEqual(['next-week', 'later']);
      expect(visible(['2026-12-01'])).toEqual([]);
    });

    it('keeps already selected periods visible so they can be deselected', () => {
      expect(visible(['2026-10-27'], ['later', 'ended'])).toEqual(['ended', 'next-week', 'later']);
    });

    it('orders periods starting the same day by supplier name', () => {
      const periods = [period('z', '2026-10-26', '2026-10-30', 'sup-z'), period('a', '2026-10-26', '2026-10-30', 'sup-a')];
      const ids = getVisibleMenuPeriods(periods, {
        targetDates: [],
        selectedIds: [],
        today,
        supplierNameById: { 'sup-a': 'Alpha Kitchen', 'sup-z': 'Zeta Kitchen' },
      }).map((p) => p.id);
      expect(ids).toEqual(['a', 'z']);
    });
  });
});
