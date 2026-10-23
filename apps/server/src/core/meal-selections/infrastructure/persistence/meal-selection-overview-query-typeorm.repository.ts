import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { ChangeRequestStatus } from '@food-up/shared';
import { DataSource } from 'typeorm';
import { IMealSelectionOverviewQueryRepository } from '../../application/queries/meal-selection-overview-query-repository.interface';
import { WindowDailyOverviewItemDto } from '../../application/queries/dto/window-daily-overview-item.dto';
import {
  buildDailyOverview,
  DailyOverviewApprovedChangeRow,
  DailyOverviewSelectionRow,
} from './daily-overview.builder';

@Injectable()
export class MealSelectionOverviewQueryTypeOrmRepository
  implements IMealSelectionOverviewQueryRepository
{
  constructor(@InjectDataSource() private readonly _dataSource: DataSource) {}

  async getDailyOverview(windowId: string): Promise<WindowDailyOverviewItemDto[]> {
    const [selectionRows, approvedChanges] = await Promise.all([
      this._querySelections(windowId),
      this._queryApprovedChanges(windowId),
    ]);

    return buildDailyOverview(selectionRows, approvedChanges);
  }

  private _querySelections(windowId: string): Promise<DailyOverviewSelectionRow[]> {
    return this._dataSource.query(
      `
      SELECT
        e.id                   AS "employeeId",
        e.name                 AS "employeeName",
        dates.date::text       AS date,
        ms.id                  AS "mealSelectionId",
        ms.menu_item_id        AS "menuItemId",
        meal.name              AS "mealName",
        meal.type              AS "mealType",
        ms.quantity            AS quantity
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
  }

  /** Approved change requests in approval order (ULID id as tiebreaker) */
  private _queryApprovedChanges(windowId: string): Promise<DailyOverviewApprovedChangeRow[]> {
    return this._dataSource.query(
      `
      SELECT
        cr.employee_id         AS "employeeId",
        cr.meal_selection_id   AS "mealSelectionId",
        cr.clear_selection     AS "clearSelection",
        cr.new_menu_item_id    AS "newMenuItemId",
        meal.name              AS "newMealName",
        meal.type              AS "newMealType",
        mi.day::text           AS "newMenuItemDay",
        cr.new_quantity        AS "newQuantity",
        cr.approved_at         AS "approvedAt"
      FROM change_request cr
      LEFT JOIN menu_item mi ON mi.id = cr.new_menu_item_id
      LEFT JOIN meal         ON meal.id = mi.meal_id
      WHERE cr.meal_selection_window_id = $1
        AND cr.status = $2
      ORDER BY cr.approved_at ASC NULLS FIRST, cr.id ASC
      `,
      [windowId, ChangeRequestStatus.Approved],
    );
  }
}
