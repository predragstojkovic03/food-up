import { Language, MealType } from '@food-up/shared';
import { I_DASHBOARD_QUERY_REPOSITORY } from 'src/core/dashboard/application/queries/dashboard-query-repository.interface';
import { I_MEAL_SELECTION_OVERVIEW_QUERY_REPOSITORY } from 'src/core/meal-selections/application/queries/meal-selection-overview-query-repository.interface';
import { I_ORDER_SUMMARY_QUERY_REPOSITORY } from 'src/core/reports/application/queries/order-summary-query-repository.interface';
import { TestBusiness, TestEmployee, TestMeal, TestMenuItem } from '../support/test-data';
import { createTestApp, TestApp } from '../support/test-app';

/**
 * The "effective order" of a window is what each employee actually gets:
 *   - their selections, with approved change requests applied in approval order
 *     (a swap replaces the meal, a removal drops it, a quantity change adjusts it),
 *   - plus approved late additions,
 *   - plus extra quantities for guests.
 * Pending, rejected and revoked requests change nothing, and a skipped day orders nothing.
 * Each selection is charged the price captured when it was made.
 *
 * Every place that reports what was ordered — the supplier order summary, the per-employee
 * XLSX rows, the manager's daily overview, the window cost summary and the dashboard —
 * must agree on it. Each scenario states the expected order once and checks all of them.
 */
describe('Effective order of a window (integration)', () => {
  const DATE = '2026-03-02';

  let t: TestApp;
  let orderSummary: any;
  let overview: any;
  let dashboard: any;

  let business: TestBusiness;
  let manager: TestEmployee;
  let ana: TestEmployee;
  let bob: TestEmployee;
  let sarma: TestMenuItem;
  let cevapi: TestMenuItem;
  let pasulj: TestMenuItem;
  let soup: TestMenuItem;
  let window: { id: string };

  beforeAll(async () => {
    t = await createTestApp();
    orderSummary = t.get(I_ORDER_SUMMARY_QUERY_REPOSITORY);
    overview = t.get(I_MEAL_SELECTION_OVERVIEW_QUERY_REPOSITORY);
    dashboard = t.get(I_DASHBOARD_QUERY_REPOSITORY);
  });

  afterAll(() => t.close());

  beforeEach(async () => {
    await t.reset();
    const d = t.data;
    business = await d.business();
    manager = await d.manager(business, { name: 'Manager' });
    ana = await d.employee(business, { name: 'Ana' });
    bob = await d.employee(business, { name: 'Bob' });
    const supplier = await d.managedSupplier(business, { name: 'Kitchen' });
    const period = await d.menuPeriod(supplier, DATE, DATE);
    const item = async (meal: TestMeal) => d.menuItem(period, meal, DATE);
    sarma = await item(await d.meal(supplier, { name: 'Sarma', type: MealType.Lunch, price: 500 }));
    cevapi = await item(await d.meal(supplier, { name: 'Cevapi', type: MealType.Lunch, price: 600 }));
    pasulj = await item(await d.meal(supplier, { name: 'Pasulj', type: MealType.Lunch, price: 450 }));
    soup = await item(await d.meal(supplier, { name: 'Soup', type: MealType.Soup, price: 200 }));
    window = await d.window(business, { menuPeriods: [period], targetDates: [DATE] });
  });

  type Line = { employee: TestEmployee; meal: string; quantity: number; price: number };
  type Guest = { guestName: string | null; meal: string; quantity: number; price: number };

  /** Checks every reporting path against one expected effective order. */
  async function expectEffectiveOrder(lines: Line[], guests: Guest[] = []) {
    const all = [...lines, ...guests];

    // Supplier order summary: total quantity per meal
    const byMeal = new Map<string, number>();
    for (const l of all) byMeal.set(l.meal, (byMeal.get(l.meal) ?? 0) + l.quantity);
    const summary = await orderSummary.getByWindow(window.id);
    expect(
      Object.fromEntries(summary.map((r: { mealName: string; totalQuantity: number }) => [r.mealName, r.totalQuantity])),
    ).toEqual(Object.fromEntries(byMeal));

    // Per-employee rows of the XLSX day sheets (named guests appear as "(guest)")
    const rows = await orderSummary.getEmployeeSelections(window.id);
    const expectedRows = [
      ...lines.map((l) => ({ who: l.employee.name, meal: l.meal, quantity: l.quantity })),
      ...guests
        .filter((g) => g.guestName)
        .map((g) => ({ who: `${g.guestName} (guest)`, meal: g.meal, quantity: g.quantity })),
    ];
    const sortRows = (r: { who: string; meal: string }[]) =>
      [...r].sort((a, b) => `${a.who}|${a.meal}`.localeCompare(`${b.who}|${b.meal}`));
    expect(
      sortRows(
        rows.map((r: { employeeName: string; mealName: string; quantity: number }) => ({
          who: r.employeeName,
          meal: r.mealName,
          quantity: r.quantity,
        })),
      ),
    ).toEqual(sortRows(expectedRows));

    // Manager's daily overview (employees only)
    const items = await overview.getDailyOverview(window.id);
    for (const employee of [ana, bob]) {
      const item = items.find((i: { employeeId: string }) => i.employeeId === employee.id);
      const expectedMeals = lines
        .filter((l) => l.employee.id === employee.id)
        .map((l) => ({ name: l.meal, quantity: l.quantity }))
        .sort((a, b) => a.name.localeCompare(b.name));
      expect(
        item.meals
          .map((m: { name: string; quantity: number }) => ({ name: m.name, quantity: m.quantity }))
          .sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name)),
      ).toEqual(expectedMeals);
    }

    // Costs: window cost summary and dashboard
    const expectedTotal = all.reduce((sum, l) => sum + l.price * l.quantity, 0);
    const costs = await orderSummary.getCostByWindow(window.id);
    expect(costs.reduce((s: number, c: { totalCost: number }) => s + c.totalCost, 0)).toBeCloseTo(expectedTotal);

    const kpis = await dashboard.getKpis('2026-03-01', '2026-03-31', business.id);
    expect(kpis.totalSpend).toBeCloseTo(expectedTotal);
    const ranking = await dashboard.getWindowRanking('2026-03-01', '2026-03-31', business.id, Language.En);
    expect(ranking.reduce((s: number, r: { totalCost: number }) => s + r.totalCost, 0)).toBeCloseTo(expectedTotal);
    const breakdown = await dashboard.getSupplierBreakdown('2026-03-01', '2026-03-31', business.id, Language.En);
    expect(
      breakdown.flatMap((w: { suppliers: { cost: number }[] }) => w.suppliers).reduce((s: number, x: { cost: number }) => s + x.cost, 0),
    ).toBeCloseTo(expectedTotal);
  }

  const cr = (opts: Omit<Parameters<TestApp['data']['changeRequest']>[0], 'window' | 'approvedBy'>) =>
    t.data.changeRequest({ window, approvedBy: manager, ...opts });

  it('orders plain selections with their quantities', async () => {
    await t.data.selection(window, ana, DATE, sarma);
    await t.data.selection(window, bob, DATE, cevapi, { quantity: 2 });
    await t.data.selection(window, bob, DATE, soup);

    await expectEffectiveOrder([
      { employee: ana, meal: 'Sarma', quantity: 1, price: 500 },
      { employee: bob, meal: 'Cevapi', quantity: 2, price: 600 },
      { employee: bob, meal: 'Soup', quantity: 1, price: 200 },
    ]);
  });

  it('orders nothing for an explicitly skipped day', async () => {
    await t.data.selection(window, ana, DATE, null, { quantity: null });

    await expectEffectiveOrder([]);
  });

  it('replaces the meal with an approved swap', async () => {
    const selection = await t.data.selection(window, ana, DATE, sarma);
    await cr({ employee: ana, selection, newMenuItem: cevapi });

    await expectEffectiveOrder([{ employee: ana, meal: 'Cevapi', quantity: 1, price: 600 }]);
  });

  it('applies the later of two approved swaps on the same selection', async () => {
    const selection = await t.data.selection(window, ana, DATE, sarma);
    await cr({ employee: ana, selection, newMenuItem: cevapi });
    await cr({ employee: ana, selection, newMenuItem: pasulj });

    await expectEffectiveOrder([{ employee: ana, meal: 'Pasulj', quantity: 1, price: 450 }]);
  });

  it('drops the meal when a swap is followed by an approved removal', async () => {
    const selection = await t.data.selection(window, ana, DATE, sarma);
    await cr({ employee: ana, selection, newMenuItem: cevapi });
    await cr({ employee: ana, selection, clearSelection: true });

    await expectEffectiveOrder([]);
  });

  it('drops the meal with an approved removal', async () => {
    const selection = await t.data.selection(window, ana, DATE, sarma);
    await t.data.selection(window, bob, DATE, sarma);
    await cr({ employee: ana, selection, clearSelection: true });

    await expectEffectiveOrder([{ employee: bob, meal: 'Sarma', quantity: 1, price: 500 }]);
  });

  it('applies an approved quantity change to the current meal', async () => {
    const selection = await t.data.selection(window, ana, DATE, sarma);
    await cr({ employee: ana, selection, newMenuItem: null, newQuantity: 3 });

    await expectEffectiveOrder([{ employee: ana, meal: 'Sarma', quantity: 3, price: 500 }]);
  });

  it('applies a swap with a new quantity', async () => {
    const selection = await t.data.selection(window, ana, DATE, sarma);
    await cr({ employee: ana, selection, newMenuItem: cevapi, newQuantity: 2 });

    await expectEffectiveOrder([{ employee: ana, meal: 'Cevapi', quantity: 2, price: 600 }]);
  });

  it('ignores pending, rejected and revoked change requests', async () => {
    const selection = await t.data.selection(window, ana, DATE, sarma);
    await cr({ employee: ana, selection, newMenuItem: cevapi, status: 'pending' });
    await cr({ employee: ana, selection, newMenuItem: pasulj, status: 'rejected' });
    await cr({ employee: ana, selection, clearSelection: true, status: 'revoked' });
    await cr({ employee: bob, newMenuItem: soup, newQuantity: 1, status: 'pending' });

    await expectEffectiveOrder([{ employee: ana, meal: 'Sarma', quantity: 1, price: 500 }]);
  });

  it('adds an approved late addition for an employee without a selection', async () => {
    await t.data.selection(window, ana, DATE, sarma);
    await cr({ employee: bob, newMenuItem: cevapi, newQuantity: 1 });
    await cr({ employee: ana, newMenuItem: soup, newQuantity: 2 });

    await expectEffectiveOrder([
      { employee: ana, meal: 'Sarma', quantity: 1, price: 500 },
      { employee: ana, meal: 'Soup', quantity: 2, price: 200 },
      { employee: bob, meal: 'Cevapi', quantity: 1, price: 600 },
    ]);
  });

  it('includes extra quantities for guests', async () => {
    await t.data.selection(window, ana, DATE, sarma);
    await t.data.extraQuantity(window, sarma, 2, null);
    await t.data.extraQuantity(window, cevapi, 1, 'Visitor');

    await expectEffectiveOrder(
      [{ employee: ana, meal: 'Sarma', quantity: 1, price: 500 }],
      [
        { guestName: null, meal: 'Sarma', quantity: 2, price: 500 },
        { guestName: 'Visitor', meal: 'Cevapi', quantity: 1, price: 600 },
      ],
    );
  });

  it('charges selections at the price captured when they were made', async () => {
    await t.data.selection(window, ana, DATE, sarma);
    await t.data.setMenuItemPrice(sarma, 900);

    await expectEffectiveOrder([{ employee: ana, meal: 'Sarma', quantity: 1, price: 500 }]);
  });
});
