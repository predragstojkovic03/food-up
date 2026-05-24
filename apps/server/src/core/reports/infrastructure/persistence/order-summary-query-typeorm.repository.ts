import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { ChangeRequestStatus } from '@food-up/shared';
import { ChangeRequest } from 'src/core/change-requests/infrastructure/persistence/change-request.typeorm-entity';
import { Employee } from 'src/core/employees/infrastructure/persistence/employee.typeorm-entity';
import { MealSelection } from 'src/core/meal-selections/infrastructure/persistence/meal-selection.typeorm-entity';
import { MenuItem } from 'src/core/menu-items/infrastructure/persistence/menu-item.typeorm-entity';
import { TransactionContext } from 'src/shared/infrastructure/transaction-context';
import { DataSource, Repository } from 'typeorm';
import { IOrderSummaryQueryRepository } from '../../application/queries/order-summary-query-repository.interface';
import { EmployeeDaySelectionRow, OrderSummaryRow } from '../../application/queries/dto/order-summary-row.dto';

const MEAL_TYPE_ORDER: Record<string, number> = {
  breakfast: 0,
  soup: 1,
  salad: 2,
  bread: 3,
  lunch: 4,
  dinner: 5,
  dessert: 6,
};

@Injectable()
export class OrderSummaryQueryTypeOrmRepository
  implements IOrderSummaryQueryRepository
{
  constructor(
    @InjectDataSource() private readonly _dataSource: DataSource,
    private readonly _transactionContext: TransactionContext,
  ) {}

  private get _msRepository(): Repository<MealSelection> {
    const manager = this._transactionContext.getManager();
    return manager
      ? manager.getRepository(MealSelection)
      : this._dataSource.getRepository(MealSelection);
  }

  private get _crRepository(): Repository<ChangeRequest> {
    const manager = this._transactionContext.getManager();
    return manager
      ? manager.getRepository(ChangeRequest)
      : this._dataSource.getRepository(ChangeRequest);
  }

  async getByWindow(windowId: string): Promise<OrderSummaryRow[]> {
    const [unaffected, modified, late] = await Promise.all([
      this._queryUnaffected(windowId),
      this._queryModified(windowId),
      this._queryLate(windowId),
    ]);
    return this._aggregate([...unaffected, ...modified, ...late]);
  }

  async getByWindowAndSupplier(
    windowId: string,
    supplierId: string,
  ): Promise<OrderSummaryRow[]> {
    const [unaffected, modified, late] = await Promise.all([
      this._queryUnaffected(windowId, supplierId),
      this._queryModified(windowId, supplierId),
      this._queryLate(windowId, supplierId),
    ]);
    return this._aggregate([...unaffected, ...modified, ...late]);
  }

  async getEmployeeSelections(windowId: string): Promise<EmployeeDaySelectionRow[]> {
    const [unaffected, modified, late] = await Promise.all([
      this._queryUnaffectedEmployee(windowId),
      this._queryModifiedEmployee(windowId),
      this._queryLateEmployee(windowId),
    ]);

    const rows = [...unaffected, ...modified, ...late];
    return rows
      .map((r) => ({
        date: r.date instanceof Date ? r.date.toISOString().slice(0, 10) : String(r.date),
        employeeName: r.employeeName,
        mealName: r.mealName,
        mealType: r.mealType,
        quantity: Number(r.quantity),
      }))
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.employeeName.localeCompare(b.employeeName);
      });
  }

  /** Selections with no approved CR — use original menu item and quantity */
  private async _queryUnaffected(
    windowId: string,
    supplierId?: string,
  ): Promise<RawRow[]> {
    const qb = this._msRepository
      .createQueryBuilder('ms')
      .innerJoin('ms.menuItem', 'mi')
      .innerJoin('mi.meal', 'm')
      .innerJoin('mi.menuPeriod', 'mp')
      .innerJoin('mp.supplier', 's')
      .select([
        's.id AS "supplierId"',
        's.name AS "supplierName"',
        'ms.date AS "date"',
        'm.type AS "mealType"',
        'm.name AS "mealName"',
        'COALESCE(ms.quantity, 1) AS "quantity"',
      ])
      .where('ms.mealSelectionWindowId = :windowId', { windowId })
      .andWhere('ms.menuItemId IS NOT NULL')
      .andWhere('COALESCE(ms.quantity, 1) > 0')
      .andWhere(
        `NOT EXISTS (
          SELECT 1 FROM change_request cr
          WHERE cr.meal_selection_id = ms.id
          AND cr.status = :approved
        )`,
        { approved: ChangeRequestStatus.Approved },
      );

    if (supplierId) {
      qb.andWhere('s.id = :supplierId', { supplierId });
    }

    return qb.getRawMany();
  }

  /** Selections where an approved non-clearing CR changes the menu item/quantity */
  private async _queryModified(
    windowId: string,
    supplierId?: string,
  ): Promise<RawRow[]> {
    const qb = this._msRepository
      .createQueryBuilder('ms')
      .innerJoin(
        ChangeRequest,
        'cr',
        'cr.mealSelectionId = ms.id AND cr.status = :approved AND cr.clearSelection = false',
        { approved: ChangeRequestStatus.Approved },
      )
      .innerJoin(MenuItem, 'mi', 'mi.id = cr.newMenuItemId')
      .innerJoin('mi.meal', 'm')
      .innerJoin('mi.menuPeriod', 'mp')
      .innerJoin('mp.supplier', 's')
      .select([
        's.id AS "supplierId"',
        's.name AS "supplierName"',
        'ms.date AS "date"',
        'm.type AS "mealType"',
        'm.name AS "mealName"',
        'COALESCE(cr.newQuantity, 1) AS "quantity"',
      ])
      .where('ms.mealSelectionWindowId = :windowId', { windowId })
      .andWhere('cr.newMenuItemId IS NOT NULL');

    if (supplierId) {
      qb.andWhere('s.id = :supplierId', { supplierId });
    }

    return qb.getRawMany();
  }

  /** CRs with no mealSelectionId (late selections) — derive date from MenuItem.day */
  private async _queryLate(
    windowId: string,
    supplierId?: string,
  ): Promise<RawRow[]> {
    const qb = this._crRepository
      .createQueryBuilder('cr')
      .innerJoin(MenuItem, 'mi', 'mi.id = cr.newMenuItemId')
      .innerJoin('mi.meal', 'm')
      .innerJoin('mi.menuPeriod', 'mp')
      .innerJoin('mp.supplier', 's')
      .select([
        's.id AS "supplierId"',
        's.name AS "supplierName"',
        'mi.day AS "date"',
        'm.type AS "mealType"',
        'm.name AS "mealName"',
        'COALESCE(cr.newQuantity, 1) AS "quantity"',
      ])
      .where('cr.mealSelectionWindowId = :windowId', { windowId })
      .andWhere('cr.mealSelectionId IS NULL')
      .andWhere('cr.status = :approved', {
        approved: ChangeRequestStatus.Approved,
      })
      .andWhere('cr.clearSelection = false')
      .andWhere('cr.newMenuItemId IS NOT NULL')
      .andWhere('COALESCE(cr.newQuantity, 1) > 0');

    if (supplierId) {
      qb.andWhere('s.id = :supplierId', { supplierId });
    }

    return qb.getRawMany();
  }

  /** Employee selections with no approved CR */
  private async _queryUnaffectedEmployee(windowId: string): Promise<EmployeeRawRow[]> {
    return this._msRepository
      .createQueryBuilder('ms')
      .innerJoin(Employee, 'e', 'e.id = ms.employeeId')
      .innerJoin('ms.menuItem', 'mi')
      .innerJoin('mi.meal', 'm')
      .select([
        'ms.date AS "date"',
        'e.name AS "employeeName"',
        'm.name AS "mealName"',
        'm.type AS "mealType"',
        'COALESCE(ms.quantity, 1) AS "quantity"',
      ])
      .where('ms.mealSelectionWindowId = :windowId', { windowId })
      .andWhere('ms.menuItemId IS NOT NULL')
      .andWhere('COALESCE(ms.quantity, 1) > 0')
      .andWhere(
        `NOT EXISTS (
          SELECT 1 FROM change_request cr
          WHERE cr.meal_selection_id = ms.id
          AND cr.status = :approved
        )`,
        { approved: ChangeRequestStatus.Approved },
      )
      .getRawMany();
  }

  /** Employee selections where an approved non-clearing CR overrides the meal */
  private async _queryModifiedEmployee(windowId: string): Promise<EmployeeRawRow[]> {
    return this._msRepository
      .createQueryBuilder('ms')
      .innerJoin(Employee, 'e', 'e.id = ms.employeeId')
      .innerJoin(
        ChangeRequest,
        'cr',
        'cr.mealSelectionId = ms.id AND cr.status = :approved AND cr.clearSelection = false',
        { approved: ChangeRequestStatus.Approved },
      )
      .innerJoin(MenuItem, 'mi', 'mi.id = cr.newMenuItemId')
      .innerJoin('mi.meal', 'm')
      .select([
        'ms.date AS "date"',
        'e.name AS "employeeName"',
        'm.name AS "mealName"',
        'm.type AS "mealType"',
        'COALESCE(cr.newQuantity, 1) AS "quantity"',
      ])
      .where('ms.mealSelectionWindowId = :windowId', { windowId })
      .andWhere('cr.newMenuItemId IS NOT NULL')
      .getRawMany();
  }

  /** Late employee selections (CRs with no original meal selection) */
  private async _queryLateEmployee(windowId: string): Promise<EmployeeRawRow[]> {
    return this._crRepository
      .createQueryBuilder('cr')
      .innerJoin(Employee, 'e', 'e.id = cr.employeeId')
      .innerJoin(MenuItem, 'mi', 'mi.id = cr.newMenuItemId')
      .innerJoin('mi.meal', 'm')
      .select([
        'mi.day AS "date"',
        'e.name AS "employeeName"',
        'm.name AS "mealName"',
        'm.type AS "mealType"',
        'COALESCE(cr.newQuantity, 1) AS "quantity"',
      ])
      .where('cr.mealSelectionWindowId = :windowId', { windowId })
      .andWhere('cr.mealSelectionId IS NULL')
      .andWhere('cr.status = :approved', {
        approved: ChangeRequestStatus.Approved,
      })
      .andWhere('cr.clearSelection = false')
      .andWhere('cr.newMenuItemId IS NOT NULL')
      .andWhere('COALESCE(cr.newQuantity, 1) > 0')
      .getRawMany();
  }

  private _aggregate(rows: RawRow[]): OrderSummaryRow[] {
    const map = new Map<string, OrderSummaryRow>();

    for (const row of rows) {
      const key = `${row.supplierId}|${row.date}|${row.mealType}|${row.mealName}`;
      const existing = map.get(key);
      const qty = Number(row.quantity);
      if (existing) {
        existing.totalQuantity += qty;
      } else {
        map.set(key, {
          supplierId: row.supplierId,
          supplierName: row.supplierName,
          date: row.date instanceof Date ? row.date.toISOString().slice(0, 10) : String(row.date),
          mealType: row.mealType,
          mealName: row.mealName,
          totalQuantity: qty,
        });
      }
    }

    return [...map.values()].sort((a, b) => {
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

type RawRow = {
  supplierId: string;
  supplierName: string;
  date: string | Date;
  mealType: string;
  mealName: string;
  quantity: string | number;
};

type EmployeeRawRow = {
  date: string | Date;
  employeeName: string;
  mealName: string;
  mealType: string;
  quantity: string | number;
};
