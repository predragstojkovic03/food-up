import { MealType } from '@food-up/shared';
import {
  buildDailyOverview,
  DailyOverviewApprovedChangeRow,
  DailyOverviewSelectionRow,
} from './daily-overview.builder';

const DATE = '2026-10-28';

function selection(overrides: Partial<DailyOverviewSelectionRow> = {}): DailyOverviewSelectionRow {
  return {
    employeeId: 'e-1',
    employeeName: 'Alice',
    date: DATE,
    mealSelectionId: 'ms-1',
    menuItemId: 'mi-chicken',
    mealName: 'Chicken',
    mealType: MealType.Lunch,
    quantity: 1,
    ...overrides,
  };
}

function change(overrides: Partial<DailyOverviewApprovedChangeRow> = {}): DailyOverviewApprovedChangeRow {
  return {
    employeeId: 'e-1',
    mealSelectionId: 'ms-1',
    clearSelection: false,
    newMenuItemId: 'mi-fish',
    newMealName: 'Fish',
    newMealType: MealType.Lunch,
    newMenuItemDay: DATE,
    newQuantity: 1,
    approvedAt: new Date('2026-10-27T10:00:00Z'),
    ...overrides,
  };
}

describe('buildDailyOverview', () => {
  it('returns original selections when there are no approved changes', () => {
    const [item] = buildDailyOverview([selection()], []);

    expect(item.status).toBe('ordered');
    expect(item.meals).toEqual([{ menuItemId: 'mi-chicken', name: 'Chicken', type: MealType.Lunch, quantity: 1 }]);
    expect(item.changes).toEqual([]);
  });

  it('marks employees without any selection as no_record', () => {
    const [item] = buildDailyOverview(
      [selection({ mealSelectionId: null, menuItemId: null, mealName: null, mealType: null, quantity: null })],
      [],
    );

    expect(item.status).toBe('no_record');
    expect(item.meals).toEqual([]);
  });

  it('applies an approved swap and records it in history', () => {
    const [item] = buildDailyOverview([selection()], [change()]);

    expect(item.meals).toEqual([{ menuItemId: 'mi-fish', name: 'Fish', type: MealType.Lunch, quantity: 1 }]);
    expect(item.changes).toEqual([
      { type: MealType.Lunch, kind: 'swap', from: 'Chicken', to: 'Fish', approvedAt: '2026-10-27T10:00:00.000Z' },
    ]);
  });

  it('chains multiple approved changes on the same selection in order', () => {
    const [item] = buildDailyOverview(
      [selection()],
      [
        change(),
        change({ newMenuItemId: 'mi-pasta', newMealName: 'Pasta', approvedAt: new Date('2026-10-27T12:00:00Z') }),
      ],
    );

    expect(item.meals.map((m) => m.name)).toEqual(['Pasta']);
    expect(item.changes.map((c) => [c.from, c.to])).toEqual([
      ['Chicken', 'Fish'],
      ['Fish', 'Pasta'],
    ]);
  });

  it('drops a removed meal and marks the day skipped when nothing is left', () => {
    const [item] = buildDailyOverview(
      [selection()],
      [change({ clearSelection: true, newMenuItemId: null, newMealName: null, newMealType: null, newQuantity: null })],
    );

    expect(item.status).toBe('skipped');
    expect(item.meals).toEqual([]);
    expect(item.changes).toEqual([
      { type: MealType.Lunch, kind: 'removal', from: 'Chicken', to: null, approvedAt: '2026-10-27T10:00:00.000Z' },
    ]);
  });

  it('adds late additions to the matching employee and day', () => {
    const [item] = buildDailyOverview(
      [selection({ mealSelectionId: null, menuItemId: null, mealName: null, mealType: null, quantity: null })],
      [change({ mealSelectionId: null, newMenuItemId: 'mi-cake', newMealName: 'Cake', newMealType: MealType.Dessert, newQuantity: 2 })],
    );

    expect(item.status).toBe('ordered');
    expect(item.meals).toEqual([{ menuItemId: 'mi-cake', name: 'Cake', type: MealType.Dessert, quantity: 2 }]);
    expect(item.changes[0]).toMatchObject({ kind: 'addition', from: null, to: 'Cake' });
  });

  it('updates quantity only when the change keeps the menu item', () => {
    const [item] = buildDailyOverview([selection()], [change({ newMenuItemId: null, newMealName: null, newMealType: null, newQuantity: 3 })]);

    expect(item.meals).toEqual([{ menuItemId: 'mi-chicken', name: 'Chicken', type: MealType.Lunch, quantity: 3 }]);
  });

  it('ignores changes for other days or unknown selections', () => {
    const [item] = buildDailyOverview(
      [selection()],
      [change({ mealSelectionId: 'ms-other' }), change({ mealSelectionId: null, newMenuItemDay: '2026-10-29' })],
    );

    expect(item.meals.map((m) => m.name)).toEqual(['Chicken']);
    expect(item.changes).toEqual([]);
  });
});
