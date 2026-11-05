import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { ChangeRequestStatus } from '@food-up/shared';
import { EFFECTIVE_ORDER_LINES } from 'src/core/meal-selections/infrastructure/persistence/effective-order-lines.sql';
import { TransactionContext } from 'src/shared/infrastructure/transaction-context';
import { DataSource } from 'typeorm';
import {
  CostByWindowRow,
  IOrderSummaryQueryRepository,
} from '../../application/queries/order-summary-query-repository.interface';
import {
  EmployeeDaySelectionRow,
  EmployeeWithoutSelectionRow,
  OrderSummaryRow,
} from '../../application/queries/dto/order-summary-row.dto';

const MEAL_TYPE_ORDER: Record<string, number> = {
  breakfast: 0,
  soup: 1,
  salad: 2,
  bread: 3,
  lunch: 4,
  dinner: 5,
  dessert: 6,
};

/** Ordered meals only: the effective order can contain skipped/removed lines. */
const ORDERED = `eol.menu_item_id IS NOT NULL AND eol.quantity > 0`;

@Injectable()
export class OrderSummaryQueryTypeOrmRepository
  implements IOrderSummaryQueryRepository
{
  constructor(
    @InjectDataSource() private readonly _dataSource: DataSource,
    private readonly _transactionContext: TransactionContext,
  ) {}

  private _query<T>(sql: string, params: unknown[]): Promise<T> {
    const manager = this._transactionContext.getManager();
    return (manager ?? this._dataSource).query(sql, params);
  }

  getByWindow(windowId: string): Promise<OrderSummaryRow[]> {
    return this._summary(windowId);
  }

  getByWindowAndSupplier(
    windowId: string,
    supplierId: string,
  ): Promise<OrderSummaryRow[]> {
    return this._summary(windowId, supplierId);
  }

  async getEmployeeSelections(
    windowId: string,
  ): Promise<EmployeeDaySelectionRow[]> {
    const rows = await this._query<
      {
        date: string;
        employeeName: string;
        mealName: string;
        mealType: string;
        quantity: number;
      }[]
    >(
      `
      SELECT eol.date::text AS "date",
             COALESCE(e.name, eol.guest_name || ' (guest)') AS "employeeName",
             m.name AS "mealName",
             m.type AS "mealType",
             eol.quantity::int AS "quantity"
      FROM ${EFFECTIVE_ORDER_LINES} eol
      JOIN menu_item mi ON mi.id = eol.menu_item_id
      JOIN meal m ON m.id = mi.meal_id
      LEFT JOIN employee e ON e.id = eol.employee_id
      WHERE eol.window_id = $1
        AND ${ORDERED}
        AND (eol.employee_id IS NOT NULL OR eol.guest_name IS NOT NULL)
      `,
      [windowId],
    );

    return rows.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.employeeName.localeCompare(b.employeeName);
    });
  }

  getEmployeesWithoutSelection(
    windowId: string,
  ): Promise<EmployeeWithoutSelectionRow[]> {
    return this._query<EmployeeWithoutSelectionRow[]>(
      `
      SELECT to_char(td.date, 'YYYY-MM-DD') AS "date", e.name AS "employeeName"
      FROM meal_selection_window w
      CROSS JOIN LATERAL unnest(w.target_dates) AS td(date)
      INNER JOIN employee e ON e.business_id = w.business_id
      INNER JOIN identity i ON i.id = e.identity_id AND i.is_active = true
      WHERE w.id = $1
        AND NOT EXISTS (
          SELECT 1 FROM meal_selection ms
          WHERE ms.meal_selection_window_id = w.id
            AND ms.employee_id = e.id
            AND ms.date = td.date
        )
        AND NOT EXISTS (
          SELECT 1 FROM change_request cr
          INNER JOIN menu_item mi ON mi.id = cr.new_menu_item_id
          WHERE cr.meal_selection_window_id = w.id
            AND cr.employee_id = e.id
            AND cr.meal_selection_id IS NULL
            AND cr.status = $2
            AND mi.day = td.date
        )
      ORDER BY td.date, e.name
    `,
      [windowId, ChangeRequestStatus.Approved],
    );
  }

  /** Employees with a selection for the day that orders nothing (skipped, or removed by a change request). */
  getSkippedEmployees(
    windowId: string,
  ): Promise<EmployeeWithoutSelectionRow[]> {
    return this._query<EmployeeWithoutSelectionRow[]>(
      `
      SELECT DISTINCT eol.date::text AS "date", e.name AS "employeeName"
      FROM ${EFFECTIVE_ORDER_LINES} eol
      JOIN employee e ON e.id = eol.employee_id
      WHERE eol.window_id = $1
        AND eol.source = 'selection'
        AND NOT (${ORDERED})
      ORDER BY "date", "employeeName"
    `,
      [windowId],
    );
  }

  async getCostByWindow(windowId: string): Promise<CostByWindowRow[]> {
    const rows = await this._query<
      { supplierId: string; supplierName: string; totalCost: string }[]
    >(
      `
      SELECT s.id AS "supplierId", s.name AS "supplierName",
             SUM(COALESCE(eol.unit_price, 0) * eol.quantity) AS "totalCost"
      FROM ${EFFECTIVE_ORDER_LINES} eol
      JOIN supplier s ON s.id = eol.supplier_id
      WHERE eol.window_id = $1 AND ${ORDERED}
      GROUP BY s.id, s.name
      ORDER BY s.name
    `,
      [windowId],
    );

    return rows.map((r) => ({
      supplierId: r.supplierId,
      supplierName: r.supplierName,
      totalCost: Number(r.totalCost),
    }));
  }

  private async _summary(
    windowId: string,
    supplierId?: string,
  ): Promise<OrderSummaryRow[]> {
    const rows = await this._query<OrderSummaryRow[]>(
      `
      SELECT s.id AS "supplierId", s.name AS "supplierName", eol.date::text AS "date",
             m.type AS "mealType", m.name AS "mealName", SUM(eol.quantity)::int AS "totalQuantity"
      FROM ${EFFECTIVE_ORDER_LINES} eol
      JOIN menu_item mi ON mi.id = eol.menu_item_id
      JOIN meal m ON m.id = mi.meal_id
      JOIN supplier s ON s.id = eol.supplier_id
      WHERE eol.window_id = $1 AND ${ORDERED}
        AND ($2::varchar IS NULL OR s.id = $2)
      GROUP BY s.id, s.name, eol.date, m.type, m.name
    `,
      [windowId, supplierId ?? null],
    );

    return rows.sort((a, b) => {
      if (a.supplierName !== b.supplierName)
        return a.supplierName.localeCompare(b.supplierName);
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      const typeOrderA = MEAL_TYPE_ORDER[a.mealType] ?? 99;
      const typeOrderB = MEAL_TYPE_ORDER[b.mealType] ?? 99;
      if (typeOrderA !== typeOrderB) return typeOrderA - typeOrderB;
      return a.mealName.localeCompare(b.mealName);
    });
  }
}
