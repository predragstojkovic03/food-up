import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ChangeRequestStatus, Language } from '@food-up/shared';
import {
  GroupBy,
  IDashboardQueryRepository,
} from '../../application/queries/dashboard-query-repository.interface';
import { DashboardKpisDto } from '../../application/dto/dashboard-kpis.dto';
import { CostTrendItemDto } from '../../application/dto/cost-trend-item.dto';
import { SupplierBreakdownItemDto } from '../../application/dto/supplier-breakdown-item.dto';
import { ChangeRequestTrendItemDto } from '../../application/dto/change-request-trend-item.dto';
import { WindowRankingItemDto } from '../../application/dto/window-ranking-item.dto';

function buildWindowLabel(targetDates: string[], language: Language): string {
  if (!targetDates.length) return 'Unknown';
  const locale = language === Language.Sr ? 'sr-Latn-RS' : 'en-GB';
  const first = new Date(targetDates[0] + 'T00:00:00Z');
  const last = new Date(targetDates[targetDates.length - 1] + 'T00:00:00Z');
  const fmtDay = (d: Date) => d.toLocaleDateString(locale, { day: 'numeric', month: 'short', timeZone: 'UTC' });
  return first.getUTCMonth() === last.getUTCMonth()
    ? `${first.getUTCDate()}–${last.getUTCDate()} ${first.toLocaleDateString(locale, { month: 'short', timeZone: 'UTC' })}`
    : `${fmtDay(first)} – ${fmtDay(last)}`;
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

@Injectable()
export class DashboardQueryTypeOrmRepository implements IDashboardQueryRepository {
  constructor(@InjectDataSource() private readonly _dataSource: DataSource) {}

  async getKpis(from: string, to: string, businessId: string): Promise<DashboardKpisDto> {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const diffMs = toDate.getTime() - fromDate.getTime();
    const prevTo = new Date(fromDate.getTime() - 86_400_000).toISOString().slice(0, 10);
    const prevFrom = new Date(fromDate.getTime() - diffMs - 86_400_000).toISOString().slice(0, 10);

    const [currentCosts, prevCosts, currentCrCount, prevCrCount] = await Promise.all([
      this._getTotalCostBySupplier(from, to, businessId),
      this._getTotalCostBySupplier(prevFrom, prevTo, businessId),
      this._getChangeRequestCount(from, to, businessId),
      this._getChangeRequestCount(prevFrom, prevTo, businessId),
    ]);

    const totalSpend = currentCosts.reduce((s, r) => s + r.totalCost, 0);
    const prevTotalSpend = prevCosts.reduce((s, r) => s + r.totalCost, 0);

    const windowCount = await this._getWindowCount(from, to, businessId);
    const prevWindowCount = await this._getWindowCount(prevFrom, prevTo, businessId);
    const avgCostPerWindow = windowCount > 0 ? totalSpend / windowCount : 0;
    const prevAvgCost = prevWindowCount > 0 ? prevTotalSpend / prevWindowCount : 0;

    const topSupplier = currentCosts.sort((a, b) => b.totalCost - a.totalCost)[0] ?? null;

    return {
      totalSpend,
      totalSpendChange: pctChange(totalSpend, prevTotalSpend),
      avgCostPerWindow,
      avgCostPerWindowChange: pctChange(avgCostPerWindow, prevAvgCost),
      topSupplier: topSupplier ? { name: topSupplier.supplierName, totalCost: topSupplier.totalCost } : null,
      totalChangeRequests: currentCrCount,
      totalChangeRequestsChange: pctChange(currentCrCount, prevCrCount),
    };
  }

  async getCostTrend(from: string, to: string, groupBy: GroupBy, businessId: string): Promise<CostTrendItemDto[]> {
    const granularity = groupBy === 'weekly' ? 'week' : 'month';
    const approved = ChangeRequestStatus.Approved;
    const rows = await this._dataSource.query<{ period: string; total_cost: string }[]>(
      `
      SELECT DATE_TRUNC($3, period_date)::date::text AS period, SUM(cost) AS total_cost
      FROM (
        SELECT ms.date::date AS period_date, mi.price * COALESCE(ms.quantity, 1) AS cost
        FROM meal_selection ms
        JOIN meal_selection_window msw ON msw.id = ms.meal_selection_window_id
        JOIN menu_item mi ON mi.id = ms.menu_item_id
        WHERE ms.date BETWEEN $1 AND $2
          AND msw.business_id = $4
          AND mi.price IS NOT NULL
          AND COALESCE(ms.quantity, 1) > 0
          AND NOT EXISTS (
            SELECT 1 FROM change_request cr
            WHERE cr.meal_selection_id = ms.id AND cr.status = '${approved}'
          )

        UNION ALL

        SELECT ms.date::date, mi.price * COALESCE(cr.new_quantity, 1)
        FROM meal_selection ms
        JOIN meal_selection_window msw ON msw.id = ms.meal_selection_window_id
        JOIN change_request cr
          ON cr.meal_selection_id = ms.id
          AND cr.status = '${approved}'
          AND cr.clear_selection = false
        JOIN menu_item mi ON mi.id = cr.new_menu_item_id
        WHERE ms.date BETWEEN $1 AND $2
          AND msw.business_id = $4
          AND cr.new_menu_item_id IS NOT NULL
          AND mi.price IS NOT NULL

        UNION ALL

        SELECT mi.day::date, mi.price * COALESCE(cr.new_quantity, 1)
        FROM change_request cr
        JOIN meal_selection_window msw ON msw.id = cr.meal_selection_window_id
        JOIN menu_item mi ON mi.id = cr.new_menu_item_id
        WHERE mi.day BETWEEN $1 AND $2
          AND msw.business_id = $4
          AND cr.meal_selection_id IS NULL
          AND cr.status = '${approved}'
          AND cr.clear_selection = false
          AND cr.new_menu_item_id IS NOT NULL
          AND mi.price IS NOT NULL
          AND COALESCE(cr.new_quantity, 1) > 0

        UNION ALL

        SELECT mi.day::date, mi.price * eq.quantity
        FROM extra_quantity eq
        JOIN meal_selection_window msw ON msw.id = eq.window_id
        JOIN menu_item mi ON mi.id = eq.menu_item_id
        WHERE mi.day BETWEEN $1 AND $2
          AND msw.business_id = $4
          AND mi.price IS NOT NULL
      ) sub
      GROUP BY 1
      ORDER BY 1
      `,
      [from, to, granularity, businessId],
    );

    return rows.map((r) => ({
      period: r.period,
      label: this._formatPeriodLabel(r.period, groupBy),
      totalCost: Number(r.total_cost),
    }));
  }

  async getSupplierBreakdown(from: string, to: string, businessId: string, language: Language): Promise<SupplierBreakdownItemDto[]> {
    const approved = ChangeRequestStatus.Approved;
    const rows = await this._dataSource.query<{
      window_id: string;
      target_dates: string[];
      supplier_id: string;
      supplier_name: string;
      total_cost: string;
    }[]>(
      `
      SELECT msw.id AS window_id, msw.target_dates, s.id AS supplier_id, s.name AS supplier_name,
             SUM(sub.cost) AS total_cost
      FROM (
        SELECT ms.meal_selection_window_id AS window_id, mp.supplier_id, mi.price * COALESCE(ms.quantity, 1) AS cost
        FROM meal_selection ms
        JOIN menu_item mi ON mi.id = ms.menu_item_id
        JOIN menu_period mp ON mp.id = mi.menu_period_id
        WHERE ms.date BETWEEN $1 AND $2
          AND mi.price IS NOT NULL
          AND COALESCE(ms.quantity, 1) > 0
          AND NOT EXISTS (
            SELECT 1 FROM change_request cr
            WHERE cr.meal_selection_id = ms.id AND cr.status = '${approved}'
          )

        UNION ALL

        SELECT ms.meal_selection_window_id, mp.supplier_id, mi.price * COALESCE(cr.new_quantity, 1)
        FROM meal_selection ms
        JOIN change_request cr
          ON cr.meal_selection_id = ms.id
          AND cr.status = '${approved}'
          AND cr.clear_selection = false
        JOIN menu_item mi ON mi.id = cr.new_menu_item_id
        JOIN menu_period mp ON mp.id = mi.menu_period_id
        WHERE ms.date BETWEEN $1 AND $2
          AND cr.new_menu_item_id IS NOT NULL
          AND mi.price IS NOT NULL

        UNION ALL

        SELECT cr.meal_selection_window_id, mp.supplier_id, mi.price * COALESCE(cr.new_quantity, 1)
        FROM change_request cr
        JOIN menu_item mi ON mi.id = cr.new_menu_item_id
        JOIN menu_period mp ON mp.id = mi.menu_period_id
        WHERE mi.day BETWEEN $1 AND $2
          AND cr.meal_selection_id IS NULL
          AND cr.status = '${approved}'
          AND cr.clear_selection = false
          AND cr.new_menu_item_id IS NOT NULL
          AND mi.price IS NOT NULL
          AND COALESCE(cr.new_quantity, 1) > 0

        UNION ALL

        SELECT eq.window_id, mp.supplier_id, mi.price * eq.quantity
        FROM extra_quantity eq
        JOIN menu_item mi ON mi.id = eq.menu_item_id
        JOIN menu_period mp ON mp.id = mi.menu_period_id
        WHERE mi.day BETWEEN $1 AND $2
          AND mi.price IS NOT NULL
      ) sub
      JOIN meal_selection_window msw ON msw.id = sub.window_id
      JOIN supplier s ON s.id = sub.supplier_id
      WHERE msw.business_id = $3
      GROUP BY msw.id, msw.target_dates, s.id, s.name
      ORDER BY msw.target_dates[1], s.name
      `,
      [from, to, businessId],
    );

    const windowMap = new Map<string, SupplierBreakdownItemDto>();
    for (const r of rows) {
      const dates = Array.isArray(r.target_dates) ? r.target_dates : [r.target_dates];
      if (!windowMap.has(r.window_id)) {
        windowMap.set(r.window_id, {
          windowId: r.window_id,
          windowLabel: buildWindowLabel(dates, language),
          windowStart: dates[0] ?? '',
          suppliers: [],
        });
      }
      windowMap.get(r.window_id)!.suppliers.push({
        supplierId: r.supplier_id,
        supplierName: r.supplier_name,
        cost: Number(r.total_cost),
      });
    }
    return [...windowMap.values()];
  }

  async getChangeRequestCounts(from: string, to: string, businessId: string, language: Language): Promise<ChangeRequestTrendItemDto[]> {
    const rows = await this._dataSource.query<{
      window_id: string;
      target_dates: string[];
      count: string;
    }[]>(
      `
      SELECT cr.meal_selection_window_id AS window_id, msw.target_dates, COUNT(*) AS count
      FROM change_request cr
      JOIN meal_selection_window msw ON msw.id = cr.meal_selection_window_id
      WHERE msw.business_id = $3
        AND EXISTS (
          SELECT 1 FROM unnest(msw.target_dates) AS td
          WHERE td::date BETWEEN $1::date AND $2::date
        )
      GROUP BY cr.meal_selection_window_id, msw.target_dates
      ORDER BY msw.target_dates[1]
      `,
      [from, to, businessId],
    );

    return rows.map((r) => {
      const dates = Array.isArray(r.target_dates) ? r.target_dates : [r.target_dates];
      return {
        windowId: r.window_id,
        windowLabel: buildWindowLabel(dates, language),
        windowStart: dates[0] ?? '',
        count: Number(r.count),
      };
    });
  }

  async getWindowRanking(from: string, to: string, businessId: string, language: Language): Promise<WindowRankingItemDto[]> {
    const approved = ChangeRequestStatus.Approved;
    const costRows = await this._dataSource.query<{
      window_id: string;
      target_dates: string[];
      supplier_names: string;
      total_cost: string;
    }[]>(
      `
      SELECT sub.window_id, msw.target_dates,
             STRING_AGG(DISTINCT s.name, ', ' ORDER BY s.name) AS supplier_names,
             SUM(sub.cost) AS total_cost
      FROM (
        SELECT ms.meal_selection_window_id AS window_id, mp.supplier_id, mi.price * COALESCE(ms.quantity, 1) AS cost
        FROM meal_selection ms
        JOIN menu_item mi ON mi.id = ms.menu_item_id
        JOIN menu_period mp ON mp.id = mi.menu_period_id
        WHERE ms.date BETWEEN $1 AND $2
          AND mi.price IS NOT NULL
          AND COALESCE(ms.quantity, 1) > 0
          AND NOT EXISTS (
            SELECT 1 FROM change_request cr
            WHERE cr.meal_selection_id = ms.id AND cr.status = '${approved}'
          )

        UNION ALL

        SELECT ms.meal_selection_window_id, mp.supplier_id, mi.price * COALESCE(cr.new_quantity, 1)
        FROM meal_selection ms
        JOIN change_request cr
          ON cr.meal_selection_id = ms.id
          AND cr.status = '${approved}'
          AND cr.clear_selection = false
        JOIN menu_item mi ON mi.id = cr.new_menu_item_id
        JOIN menu_period mp ON mp.id = mi.menu_period_id
        WHERE ms.date BETWEEN $1 AND $2
          AND cr.new_menu_item_id IS NOT NULL
          AND mi.price IS NOT NULL

        UNION ALL

        SELECT cr.meal_selection_window_id, mp.supplier_id, mi.price * COALESCE(cr.new_quantity, 1)
        FROM change_request cr
        JOIN menu_item mi ON mi.id = cr.new_menu_item_id
        JOIN menu_period mp ON mp.id = mi.menu_period_id
        WHERE mi.day BETWEEN $1 AND $2
          AND cr.meal_selection_id IS NULL
          AND cr.status = '${approved}'
          AND cr.clear_selection = false
          AND cr.new_menu_item_id IS NOT NULL
          AND mi.price IS NOT NULL
          AND COALESCE(cr.new_quantity, 1) > 0

        UNION ALL

        SELECT eq.window_id, mp.supplier_id, mi.price * eq.quantity
        FROM extra_quantity eq
        JOIN menu_item mi ON mi.id = eq.menu_item_id
        JOIN menu_period mp ON mp.id = mi.menu_period_id
        WHERE mi.day BETWEEN $1 AND $2
          AND mi.price IS NOT NULL
      ) sub
      JOIN meal_selection_window msw ON msw.id = sub.window_id
      JOIN supplier s ON s.id = sub.supplier_id
      WHERE msw.business_id = $3
      GROUP BY sub.window_id, msw.target_dates
      ORDER BY total_cost DESC
      `,
      [from, to, businessId],
    );

    return costRows.map((r) => {
      const dates = Array.isArray(r.target_dates) ? r.target_dates : [r.target_dates];
      return {
        windowId: r.window_id,
        windowLabel: buildWindowLabel(dates, language),
        startDate: dates[0] ?? '',
        endDate: dates[dates.length - 1] ?? '',
        supplierNames: r.supplier_names ? r.supplier_names.split(', ') : [],
        totalCost: Number(r.total_cost),
      };
    });
  }

  private async _getTotalCostBySupplier(
    from: string,
    to: string,
    businessId: string,
  ): Promise<{ supplierId: string; supplierName: string; totalCost: number }[]> {
    const approved = ChangeRequestStatus.Approved;
    const rows = await this._dataSource.query<{ supplier_id: string; supplier_name: string; total_cost: string }[]>(
      `
      SELECT s.id AS supplier_id, s.name AS supplier_name, SUM(sub.cost) AS total_cost
      FROM (
        SELECT mp.supplier_id, mi.price * COALESCE(ms.quantity, 1) AS cost
        FROM meal_selection ms
        JOIN menu_item mi ON mi.id = ms.menu_item_id
        JOIN menu_period mp ON mp.id = mi.menu_period_id
        JOIN meal_selection_window msw ON msw.id = ms.meal_selection_window_id
        WHERE ms.date BETWEEN $1 AND $2
          AND msw.business_id = $3
          AND mi.price IS NOT NULL
          AND COALESCE(ms.quantity, 1) > 0
          AND NOT EXISTS (
            SELECT 1 FROM change_request cr
            WHERE cr.meal_selection_id = ms.id AND cr.status = '${approved}'
          )

        UNION ALL

        SELECT mp.supplier_id, mi.price * COALESCE(cr.new_quantity, 1)
        FROM meal_selection ms
        JOIN meal_selection_window msw ON msw.id = ms.meal_selection_window_id
        JOIN change_request cr
          ON cr.meal_selection_id = ms.id
          AND cr.status = '${approved}'
          AND cr.clear_selection = false
        JOIN menu_item mi ON mi.id = cr.new_menu_item_id
        JOIN menu_period mp ON mp.id = mi.menu_period_id
        WHERE ms.date BETWEEN $1 AND $2
          AND msw.business_id = $3
          AND cr.new_menu_item_id IS NOT NULL
          AND mi.price IS NOT NULL

        UNION ALL

        SELECT mp.supplier_id, mi.price * COALESCE(cr.new_quantity, 1)
        FROM change_request cr
        JOIN meal_selection_window msw ON msw.id = cr.meal_selection_window_id
        JOIN menu_item mi ON mi.id = cr.new_menu_item_id
        JOIN menu_period mp ON mp.id = mi.menu_period_id
        WHERE mi.day BETWEEN $1 AND $2
          AND msw.business_id = $3
          AND cr.meal_selection_id IS NULL
          AND cr.status = '${approved}'
          AND cr.clear_selection = false
          AND cr.new_menu_item_id IS NOT NULL
          AND mi.price IS NOT NULL
          AND COALESCE(cr.new_quantity, 1) > 0

        UNION ALL

        SELECT mp.supplier_id, mi.price * eq.quantity
        FROM extra_quantity eq
        JOIN meal_selection_window msw ON msw.id = eq.window_id
        JOIN menu_item mi ON mi.id = eq.menu_item_id
        JOIN menu_period mp ON mp.id = mi.menu_period_id
        WHERE mi.day BETWEEN $1 AND $2
          AND msw.business_id = $3
          AND mi.price IS NOT NULL
      ) sub
      JOIN supplier s ON s.id = sub.supplier_id
      GROUP BY s.id, s.name
      `,
      [from, to, businessId],
    );
    return rows.map((r) => ({
      supplierId: r.supplier_id,
      supplierName: r.supplier_name,
      totalCost: Number(r.total_cost),
    }));
  }

  private async _getChangeRequestCount(from: string, to: string, businessId: string): Promise<number> {
    const [row] = await this._dataSource.query<{ count: string }[]>(
      `
      SELECT COUNT(*) AS count
      FROM change_request cr
      JOIN meal_selection_window msw ON msw.id = cr.meal_selection_window_id
      WHERE msw.business_id = $3
        AND EXISTS (
          SELECT 1 FROM unnest(msw.target_dates) AS td
          WHERE td::date BETWEEN $1::date AND $2::date
        )
      `,
      [from, to, businessId],
    );
    return Number(row?.count ?? 0);
  }

  private async _getWindowCount(from: string, to: string, businessId: string): Promise<number> {
    const [row] = await this._dataSource.query<{ count: string }[]>(
      `
      SELECT COUNT(*) AS count
      FROM meal_selection_window msw
      WHERE msw.business_id = $3
        AND EXISTS (
          SELECT 1 FROM unnest(msw.target_dates) AS td
          WHERE td::date BETWEEN $1::date AND $2::date
        )
      `,
      [from, to, businessId],
    );
    return Number(row?.count ?? 0);
  }

  private _formatPeriodLabel(period: string, groupBy: GroupBy): string {
    const date = new Date(period);
    if (groupBy === 'monthly') {
      return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
    }
    const end = new Date(date);
    end.setDate(end.getDate() + 6);
    return `${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
  }
}
