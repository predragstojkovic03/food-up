import { MealType } from '@food-up/shared';
import {
  WindowDailyOverviewChangeDto,
  WindowDailyOverviewItemDto,
  WindowDailyOverviewMealDto,
} from '../../application/queries/dto/window-daily-overview-item.dto';

/** One row per employee × target date × original meal selection (nulls when none) */
export interface DailyOverviewSelectionRow {
  employeeId: string;
  employeeName: string;
  date: string;
  mealSelectionId: string | null;
  menuItemId: string | null;
  mealName: string | null;
  mealType: string | null;
  quantity: number | string | null;
}

/** Approved change request with its requested menu item resolved */
export interface DailyOverviewApprovedChangeRow {
  employeeId: string;
  mealSelectionId: string | null;
  clearSelection: boolean;
  newMenuItemId: string | null;
  newMealName: string | null;
  newMealType: string | null;
  newMenuItemDay: string | null;
  newQuantity: number | string | null;
  approvedAt: Date | string | null;
}

interface SelectionState {
  originalType: MealType | null;
  current: WindowDailyOverviewMealDto | null;
}

interface ItemState {
  employeeId: string;
  employeeName: string;
  date: string;
  hasRecord: boolean;
  selections: SelectionState[];
  changes: WindowDailyOverviewChangeDto[];
}

function toMeal(
  menuItemId: string | null,
  name: string | null,
  type: string | null,
  quantity: number | string | null,
): WindowDailyOverviewMealDto | null {
  if (!menuItemId || name === null || type === null) return null;
  return { menuItemId, name, type: type as MealType, quantity: quantity === null ? 1 : Number(quantity) };
}

function toIso(value: Date | string | null): string | null {
  if (value === null) return null;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

/**
 * Builds the per-employee per-day overview with approved change requests applied
 * in approval order — swaps replace the meal, removals drop it, late additions add one.
 * Mirrors how the order summary report resolves effective selections.
 */
export function buildDailyOverview(
  selectionRows: DailyOverviewSelectionRow[],
  approvedChanges: DailyOverviewApprovedChangeRow[],
): WindowDailyOverviewItemDto[] {
  const items = new Map<string, ItemState>();
  const selectionsById = new Map<string, { item: ItemState; selection: SelectionState }>();

  for (const row of selectionRows) {
    const key = `${row.employeeId}::${row.date}`;
    let item = items.get(key);
    if (!item) {
      item = {
        employeeId: row.employeeId,
        employeeName: row.employeeName,
        date: row.date,
        hasRecord: false,
        selections: [],
        changes: [],
      };
      items.set(key, item);
    }

    if (row.mealSelectionId === null) continue;
    item.hasRecord = true;

    const selection: SelectionState = {
      originalType: row.mealType as MealType | null,
      current: toMeal(row.menuItemId, row.mealName, row.mealType, row.quantity),
    };
    item.selections.push(selection);
    selectionsById.set(row.mealSelectionId, { item, selection });
  }

  for (const change of approvedChanges) {
    const requested = change.clearSelection
      ? null
      : toMeal(change.newMenuItemId, change.newMealName, change.newMealType, change.newQuantity);
    const approvedAt = toIso(change.approvedAt);

    if (change.mealSelectionId !== null) {
      const target = selectionsById.get(change.mealSelectionId);
      if (!target) continue;

      const previous = target.selection.current;
      const next =
        !change.clearSelection && !change.newMenuItemId && previous
          ? { ...previous, quantity: Number(change.newQuantity ?? previous.quantity) }
          : requested;
      // Swaps keep the meal type (enforced when the change request is created)
      const type = previous?.type ?? target.selection.originalType ?? next?.type;
      if (!type) continue;

      target.selection.current = next;
      target.item.changes.push({
        type,
        kind: change.clearSelection ? 'removal' : 'swap',
        from: previous?.name ?? null,
        to: next?.name ?? null,
        approvedAt,
      });
      continue;
    }

    if (!requested || !change.newMenuItemDay) continue;
    const item = items.get(`${change.employeeId}::${change.newMenuItemDay}`);
    if (!item) continue;

    item.selections.push({ originalType: requested.type, current: requested });
    item.changes.push({ type: requested.type, kind: 'addition', from: null, to: requested.name, approvedAt });
  }

  return [...items.values()].map((item) => {
    const meals = item.selections
      .map((s) => s.current)
      .filter((meal): meal is WindowDailyOverviewMealDto => meal !== null && meal.quantity > 0);
    const hasAddition = item.changes.some((c) => c.kind === 'addition');

    let status: WindowDailyOverviewItemDto['status'];
    if (!item.hasRecord && !hasAddition) {
      status = 'no_record';
    } else if (meals.length === 0) {
      status = 'skipped';
    } else {
      status = 'ordered';
    }

    return {
      employeeId: item.employeeId,
      employeeName: item.employeeName,
      date: item.date,
      status,
      meals,
      changes: item.changes,
    };
  });
}
