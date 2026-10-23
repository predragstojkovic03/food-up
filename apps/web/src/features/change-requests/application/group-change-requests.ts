import { MEAL_TYPE_ORDER } from '@/shared/domain/meal-type-order';
import { IRichChangeRequest } from '@food-up/shared';

export interface EmployeeChangeGroup {
  employeeId: string;
  employeeName: string;
  items: IRichChangeRequest[];
}

export interface DayChangeGroup {
  date: string | null;
  employees: EmployeeChangeGroup[];
}

function mealTypeRank(cr: IRichChangeRequest): number {
  const type = cr.currentMeal?.type ?? cr.requestedMeal?.type;
  const index = type ? MEAL_TYPE_ORDER.indexOf(type) : -1;
  return index === -1 ? MEAL_TYPE_ORDER.length : index;
}

export function groupChangeRequestsByDay(changeRequests: IRichChangeRequest[]): DayChangeGroup[] {
  const byDay = new Map<string | null, Map<string, EmployeeChangeGroup>>();

  for (const cr of changeRequests) {
    const dayKey = cr.date ? cr.date.slice(0, 10) : null;
    let employees = byDay.get(dayKey);
    if (!employees) {
      employees = new Map();
      byDay.set(dayKey, employees);
    }

    let group = employees.get(cr.employeeId);
    if (!group) {
      group = { employeeId: cr.employeeId, employeeName: cr.employeeName, items: [] };
      employees.set(cr.employeeId, group);
    }
    group.items.push(cr);
  }

  return [...byDay.entries()]
    .sort(([a], [b]) => {
      if (a === null) return 1;
      if (b === null) return -1;
      return a.localeCompare(b);
    })
    .map(([date, employees]) => ({
      date,
      employees: [...employees.values()]
        .sort((a, b) => a.employeeName.localeCompare(b.employeeName))
        .map((group) => ({ ...group, items: group.items.sort((a, b) => mealTypeRank(a) - mealTypeRank(b)) })),
    }));
}
