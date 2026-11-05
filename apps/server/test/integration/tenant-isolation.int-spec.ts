import { Language, MealType } from '@food-up/shared';
import { I_CHANGE_REQUESTS_QUERY_REPOSITORY } from 'src/core/change-requests/application/queries/change-requests-query-repository.interface';
import { I_DASHBOARD_QUERY_REPOSITORY } from 'src/core/dashboard/application/queries/dashboard-query-repository.interface';
import { I_MEAL_SELECTION_OVERVIEW_QUERY_REPOSITORY } from 'src/core/meal-selections/application/queries/meal-selection-overview-query-repository.interface';
import { I_ORDER_SUMMARY_QUERY_REPOSITORY } from 'src/core/reports/application/queries/order-summary-query-repository.interface';
import { createTestApp, TestApp } from '../support/test-app';

/**
 * Two businesses order from the same partner supplier's menu period. Reports and views are
 * keyed by window, so nothing about one business may show up in the other's results.
 */
describe('Tenant isolation of read queries (integration)', () => {
  const DATE = '2026-03-02';
  let t: TestApp;

  beforeAll(async () => {
    t = await createTestApp();
  });

  afterAll(() => t.close());

  it("never mixes another business's orders into a window's reports", async () => {
    await t.reset();
    const d = t.data;
    const bizA = await d.business({ name: 'A' });
    const bizB = await d.business({ name: 'B' });
    const managerA = await d.manager(bizA, { name: 'Manager A' });
    const managerB = await d.manager(bizB, { name: 'Manager B' });
    const anaA = await d.employee(bizA, { name: 'Ana A' });
    const bobB = await d.employee(bizB, { name: 'Bob B' });

    const partner = await d.partnerSupplier([bizA, bizB], { name: 'Shared Kitchen' });
    const period = await d.menuPeriod(partner, DATE, DATE);
    const sarma = await d.menuItem(period, await d.meal(partner, { name: 'Sarma', type: MealType.Lunch, price: 500 }), DATE);
    const cevapi = await d.menuItem(period, await d.meal(partner, { name: 'Cevapi', type: MealType.Lunch, price: 600 }), DATE);

    const windowA = await d.window(bizA, { menuPeriods: [period], targetDates: [DATE] });
    const windowB = await d.window(bizB, { menuPeriods: [period], targetDates: [DATE] });

    const selA = await d.selection(windowA, anaA, DATE, sarma);
    const selB = await d.selection(windowB, bobB, DATE, sarma, { quantity: 3 });
    await d.changeRequest({ window: windowB, employee: bobB, selection: selB, newMenuItem: cevapi, newQuantity: 3, approvedBy: managerB });
    await d.changeRequest({ window: windowB, employee: bobB, newMenuItem: sarma, newQuantity: 2, approvedBy: managerB });
    await d.changeRequest({ window: windowA, employee: anaA, selection: selA, newMenuItem: cevapi, status: 'pending' });
    await d.extraQuantity(windowB, sarma, 4, 'Guest of B');

    const orderSummary: any = t.get(I_ORDER_SUMMARY_QUERY_REPOSITORY);
    const overview: any = t.get(I_MEAL_SELECTION_OVERVIEW_QUERY_REPOSITORY);
    const changeRequests: any = t.get(I_CHANGE_REQUESTS_QUERY_REPOSITORY);
    const dashboard: any = t.get(I_DASHBOARD_QUERY_REPOSITORY);

    expect(
      (await orderSummary.getByWindow(windowA.id)).map((r: any) => [r.mealName, r.totalQuantity]),
    ).toEqual([['Sarma', 1]]);
    expect((await orderSummary.getEmployeeSelections(windowA.id)).map((r: any) => r.employeeName)).toEqual(['Ana A']);
    expect((await orderSummary.getCostByWindow(windowA.id)).map((r: any) => r.totalCost)).toEqual([500]);

    const overviewA = await overview.getDailyOverview(windowA.id);
    expect(overviewA.map((i: any) => i.employeeName).sort()).toEqual(['Ana A', 'Manager A']);

    const crsA = await changeRequests.findRichByWindow(windowA.id);
    expect(crsA.map((c: any) => c.employeeName)).toEqual(['Ana A']);
    expect(await changeRequests.findPendingCountByWindow(windowA.id)).toBe(1);

    const kpisA = await dashboard.getKpis('2026-03-01', '2026-03-31', bizA.id);
    expect(kpisA.totalSpend).toBe(500);
    expect(kpisA.totalChangeRequests).toBe(1);
    const breakdownA = await dashboard.getSupplierBreakdown('2026-03-01', '2026-03-31', bizA.id, Language.En);
    expect(breakdownA.map((w: any) => w.windowId)).toEqual([windowA.id]);
    const rankingA = await dashboard.getWindowRanking('2026-03-01', '2026-03-31', bizA.id, Language.En);
    expect(rankingA.map((w: any) => [w.windowId, w.totalCost])).toEqual([[windowA.id, 500]]);
    const crTrendA = await dashboard.getChangeRequestCounts('2026-03-01', '2026-03-31', bizA.id, Language.En);
    expect(crTrendA.map((w: any) => w.windowId)).toEqual([windowA.id]);
    const costTrendA = await dashboard.getCostTrend('2026-03-01', '2026-03-31', 'monthly', bizA.id, Language.En);
    expect(costTrendA.reduce((s: number, p: any) => s + p.totalCost, 0)).toBe(500);

    // And the other way around: B sees only B
    expect((await orderSummary.getEmployeeSelections(windowB.id)).map((r: any) => r.employeeName).sort()).toEqual([
      'Bob B',
      'Bob B',
      'Guest of B (guest)',
    ]);
    expect((await overview.getDailyOverview(windowB.id)).map((i: any) => i.employeeName).sort()).toEqual([
      'Bob B',
      'Manager B',
    ]);
    expect(managerA.businessId).not.toBe(managerB.businessId);
  });
});
