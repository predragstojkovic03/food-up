import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { MealType } from '@food-up/shared';
import { DataSource } from 'typeorm';
import { IMealSelectionOverviewQueryRepository } from '../../application/queries/meal-selection-overview-query-repository.interface';
import { WindowDailyOverviewItemDto } from '../../application/queries/dto/window-daily-overview-item.dto';

interface RawRow {
  employeeId: string;
  employeeName: string;
  date: string;
  mealSelectionId: string | null;
  mealName: string | null;
  mealType: string | null;
}

@Injectable()
export class MealSelectionOverviewQueryTypeOrmRepository
  implements IMealSelectionOverviewQueryRepository
{
  constructor(@InjectDataSource() private readonly _dataSource: DataSource) {}

  async getDailyOverview(windowId: string): Promise<WindowDailyOverviewItemDto[]> {
    const rows: RawRow[] = await this._dataSource.query(
      `
      SELECT
        e.id                   AS "employeeId",
        e.name                 AS "employeeName",
        dates.date::text       AS date,
        ms.id                  AS "mealSelectionId",
        meal.name              AS "mealName",
        meal.type              AS "mealType"
      FROM employee e
      CROSS JOIN (
        SELECT UNNEST(w.target_dates) AS date
        FROM meal_selection_window w
        WHERE w.id = $1
      ) dates
      LEFT JOIN meal_selection ms
        ON  ms.employee_id               = e.id
        AND ms.meal_selection_window_id  = $1
        AND ms.date                      = dates.date
      LEFT JOIN menu_item mi ON mi.id   = ms.menu_item_id
      LEFT JOIN meal       ON meal.id   = mi.meal_id
      WHERE e.business_id = (
        SELECT business_id FROM meal_selection_window WHERE id = $1
      )
      ORDER BY e.name, dates.date
      `,
      [windowId],
    );

    return this._mapRows(rows);
  }

  private _mapRows(rows: RawRow[]): WindowDailyOverviewItemDto[] {
    const grouped = new Map<
      string,
      { employeeId: string; employeeName: string; date: string; rows: RawRow[] }
    >();

    for (const row of rows) {
      const key = `${row.employeeId}::${row.date}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          employeeId: row.employeeId,
          employeeName: row.employeeName,
          date: row.date,
          rows: [],
        });
      }
      grouped.get(key)!.rows.push(row);
    }

    return [...grouped.values()].map(({ employeeId, employeeName, date, rows: groupRows }) => {
      const hasAnyRecord = groupRows.some((r) => r.mealSelectionId !== null);
      const meals = groupRows
        .filter((r) => r.mealName !== null)
        .map((r) => ({ name: r.mealName!, type: r.mealType as MealType }));

      let status: 'ordered' | 'skipped' | 'no_record';
      if (!hasAnyRecord) {
        status = 'no_record';
      } else if (meals.length === 0) {
        status = 'skipped';
      } else {
        status = 'ordered';
      }

      return { employeeId, employeeName, date, status, meals };
    });
  }
}
