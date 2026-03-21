import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { ChangeRequestStatus } from '@food-up/shared';
import { ChangeRequest } from 'src/core/change-requests/infrastructure/persistence/change-request.typeorm-entity';
import { MealSelection } from 'src/core/meal-selections/infrastructure/persistence/meal-selection.typeorm-entity';
import { MenuItem } from 'src/core/menu-items/infrastructure/persistence/menu-item.typeorm-entity';
import { TransactionContext } from 'src/shared/infrastructure/transaction-context';
import { DataSource, Repository } from 'typeorm';
import { IOrderSummaryQueryRepository } from '../../application/queries/order-summary-query-repository.interface';
import { OrderSummaryRow } from '../../application/queries/dto/order-summary-row.dto';

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

  private _aggregate(rows: RawRow[]): OrderSummaryRow[] {
    const map = new Map<string, OrderSummaryRow>();

    for (const row of rows) {
      const key = `${row.supplierId}|${row.date}|${row.mealName}`;
      const existing = map.get(key);
      const qty = Number(row.quantity);
      if (existing) {
        existing.totalQuantity += qty;
      } else {
        map.set(key, {
          supplierId: row.supplierId,
          supplierName: row.supplierName,
          date: row.date instanceof Date ? row.date.toISOString().slice(0, 10) : String(row.date),
          mealName: row.mealName,
          totalQuantity: qty,
        });
      }
    }

    return [...map.values()].sort((a, b) => {
      if (a.supplierName !== b.supplierName)
        return a.supplierName.localeCompare(b.supplierName);
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.mealName.localeCompare(b.mealName);
    });
  }
}

type RawRow = {
  supplierId: string;
  supplierName: string;
  date: string | Date;
  mealName: string;
  quantity: string | number;
};
