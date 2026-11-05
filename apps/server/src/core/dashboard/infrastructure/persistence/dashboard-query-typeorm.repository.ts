import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Language } from '@food-up/shared';
import { EFFECTIVE_ORDER_LINES } from 'src/core/meal-selections/infrastructure/persistence/effective-order-lines.sql';
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
  const first = new Date(targetDates[0]);
  const last = new Date(targetDates[targetDates.length - 1]);
  const fmtDay = (d: Date) =>
    d.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    });
  return first.getUTCMonth() === last.getUTCMonth()
    ? `${first.getUTCDate()}–${last.getUTCDate()} ${first.toLocaleDateString(locale, { month: 'short', timeZone: 'UTC' })}`
    : `${fmtDay(first)} – ${fmtDay(last)}`;
}

/** Ordered meals only: the effective order can contain skipped/removed lines. */
const ORDERED = `eol.menu_item_id IS NOT NULL AND eol.quantity > 0`;

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

@Injectable()
export class DashboardQueryTypeOrmRepository
  implements IDashboardQueryRepository
{
  constructor(@InjectDataSource() private readonly _dataSource: DataSource) {}

  async getKpis(
    from: string,
    to: string,
    businessId: string,
  ): Promise<DashboardKpisDto> {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const diffMs = toDate.getTime() - fromDate.getTime();
    const prevTo = new Date(fromDate.getTime() - 86_400_000)
      .toISOString()
      .slice(0, 10);
    const prevFrom = new Date(fromDate.getTime() - diffMs - 86_400_000)
      .toISOString()
      .slice(0, 10);

    const [currentCosts, prevCosts, currentCrCount, prevCrCount] =
      await Promise.all([
        this._getTotalCostBySupplier(from, to, businessId),
        this._getTotalCostBySupplier(prevFrom, prevTo, businessId),
        this._getChangeRequestCount(from, to, businessId),
        this._getChangeRequestCount(prevFrom, prevTo, businessId),
      ]);

    const totalSpend = currentCosts.reduce((s, r) => s + r.totalCost, 0);
    const prevTotalSpend = prevCosts.reduce((s, r) => s + r.totalCost, 0);

    const windowCount = await this._getWindowCount(from, to, businessId);
    const prevWindowCount = await this._getWindowCount(
      prevFrom,
      prevTo,
      businessId,
    );
    const avgCostPerWindow = windowCount > 0 ? totalSpend / windowCount : 0;
    const prevAvgCost =
      prevWindowCount > 0 ? prevTotalSpend / prevWindowCount : 0;

    const topSupplier =
      currentCosts.sort((a, b) => b.totalCost - a.totalCost)[0] ?? null;

    return {
      totalSpend,
      totalSpendChange: pctChange(totalSpend, prevTotalSpend),
      avgCostPerWindow,
      avgCostPerWindowChange: pctChange(avgCostPerWindow, prevAvgCost),
      topSupplier: topSupplier
        ? { name: topSupplier.supplierName, totalCost: topSupplier.totalCost }
        : null,
      totalChangeRequests: currentCrCount,
      totalChangeRequestsChange: pctChange(currentCrCount, prevCrCount),
    };
  }

  async getCostTrend(
    from: string,
    to: string,
    groupBy: GroupBy,
    businessId: string,
    language: Language,
  ): Promise<CostTrendItemDto[]> {
    const granularity = groupBy === 'weekly' ? 'week' : 'month';
    const rows = await this._dataSource.query<
      { period: string; total_cost: string }[]
    >(
      `
      SELECT DATE_TRUNC($3, eol.date)::date::text AS period,
             SUM(COALESCE(eol.unit_price, 0) * eol.quantity) AS total_cost
      FROM ${EFFECTIVE_ORDER_LINES} eol
      WHERE eol.business_id = $4
        AND eol.date BETWEEN $1 AND $2
        AND ${ORDERED}
      GROUP BY 1
      ORDER BY 1
      `,
      [from, to, granularity, businessId],
    );

    return rows.map((r) => ({
      period: r.period,
      label: this._formatPeriodLabel(r.period, groupBy, language),
      totalCost: Number(r.total_cost),
    }));
  }

  async getSupplierBreakdown(
    from: string,
    to: string,
    businessId: string,
    language: Language,
  ): Promise<SupplierBreakdownItemDto[]> {
    const rows = await this._dataSource.query<
      {
        window_id: string;
        target_dates: string[];
        supplier_id: string;
        supplier_name: string;
        total_cost: string;
      }[]
    >(
      `
      SELECT msw.id AS window_id, msw.target_dates, s.id AS supplier_id, s.name AS supplier_name,
             SUM(COALESCE(eol.unit_price, 0) * eol.quantity) AS total_cost
      FROM ${EFFECTIVE_ORDER_LINES} eol
      JOIN meal_selection_window msw ON msw.id = eol.window_id
      JOIN supplier s ON s.id = eol.supplier_id
      WHERE eol.business_id = $3
        AND eol.date BETWEEN $1 AND $2
        AND ${ORDERED}
      GROUP BY msw.id, msw.target_dates, s.id, s.name
      ORDER BY msw.target_dates[1], s.name
      `,
      [from, to, businessId],
    );

    const windowMap = new Map<string, SupplierBreakdownItemDto>();
    for (const r of rows) {
      const dates = Array.isArray(r.target_dates)
        ? r.target_dates
        : [r.target_dates];
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

  async getChangeRequestCounts(
    from: string,
    to: string,
    businessId: string,
    language: Language,
  ): Promise<ChangeRequestTrendItemDto[]> {
    const rows = await this._dataSource.query<
      {
        window_id: string;
        target_dates: string[];
        count: string;
      }[]
    >(
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
      const dates = Array.isArray(r.target_dates)
        ? r.target_dates
        : [r.target_dates];
      return {
        windowId: r.window_id,
        windowLabel: buildWindowLabel(dates, language),
        windowStart: dates[0] ?? '',
        count: Number(r.count),
      };
    });
  }

  async getWindowRanking(
    from: string,
    to: string,
    businessId: string,
    language: Language,
  ): Promise<WindowRankingItemDto[]> {
    const costRows = await this._dataSource.query<
      {
        window_id: string;
        target_dates: string[];
        supplier_names: string;
        total_cost: string;
      }[]
    >(
      `
      SELECT eol.window_id, msw.target_dates,
             STRING_AGG(DISTINCT s.name, ', ' ORDER BY s.name) AS supplier_names,
             SUM(COALESCE(eol.unit_price, 0) * eol.quantity) AS total_cost
      FROM ${EFFECTIVE_ORDER_LINES} eol
      JOIN meal_selection_window msw ON msw.id = eol.window_id
      JOIN supplier s ON s.id = eol.supplier_id
      WHERE eol.business_id = $3
        AND eol.date BETWEEN $1 AND $2
        AND ${ORDERED}
      GROUP BY eol.window_id, msw.target_dates
      ORDER BY total_cost DESC
      `,
      [from, to, businessId],
    );

    return costRows.map((r) => {
      const dates = Array.isArray(r.target_dates)
        ? r.target_dates
        : [r.target_dates];
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
  ): Promise<
    { supplierId: string; supplierName: string; totalCost: number }[]
  > {
    const rows = await this._dataSource.query<
      { supplier_id: string; supplier_name: string; total_cost: string }[]
    >(
      `
      SELECT s.id AS supplier_id, s.name AS supplier_name,
             SUM(COALESCE(eol.unit_price, 0) * eol.quantity) AS total_cost
      FROM ${EFFECTIVE_ORDER_LINES} eol
      JOIN supplier s ON s.id = eol.supplier_id
      WHERE eol.business_id = $3
        AND eol.date BETWEEN $1 AND $2
        AND ${ORDERED}
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

  private async _getChangeRequestCount(
    from: string,
    to: string,
    businessId: string,
  ): Promise<number> {
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

  private async _getWindowCount(
    from: string,
    to: string,
    businessId: string,
  ): Promise<number> {
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

  private _formatPeriodLabel(
    period: string,
    groupBy: GroupBy,
    language: Language,
  ): string {
    const locale = language === Language.Sr ? 'sr-Latn-RS' : 'en-GB';
    const date = new Date(period);
    if (groupBy === 'monthly') {
      return date.toLocaleDateString(locale, {
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
      });
    }
    const end = new Date(date.getTime() + 6 * 86_400_000);
    return `${date.toLocaleDateString(locale, { day: 'numeric', month: 'short', timeZone: 'UTC' })} – ${end.toLocaleDateString(locale, { day: 'numeric', month: 'short', timeZone: 'UTC' })}`;
  }
}
