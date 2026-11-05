import { MealType } from '@food-up/shared';
import { I_MEAL_SELECTION_OVERVIEW_QUERY_REPOSITORY } from 'src/core/meal-selections/application/queries/meal-selection-overview-query-repository.interface';
import { createTestApp, TestApp } from '../support/test-app';

/**
 * The manager's daily overview lists the business's employees per target date. Deactivated
 * employees are only listed when they still have something in the window, so the overview
 * keeps matching what is ordered from the supplier.
 */
describe('Daily overview (integration)', () => {
  const DATE = '2026-03-02';
  let t: TestApp;

  beforeAll(async () => {
    t = await createTestApp();
  });

  afterAll(() => t.close());

  it('hides deactivated employees with nothing in the window, but keeps those with orders', async () => {
    await t.reset();
    const d = t.data;
    const business = await d.business();
    const manager = await d.manager(business, { name: 'Manager' });
    const active = await d.employee(business, { name: 'Active, no order' });
    const leftEmpty = await d.employee(business, {
      name: 'Deactivated, no order',
      active: false,
    });
    const leftOrdered = await d.employee(business, {
      name: 'Deactivated, ordered',
      active: false,
    });
    const leftLateAddition = await d.employee(business, {
      name: 'Deactivated, late addition',
      active: false,
    });

    const supplier = await d.managedSupplier(business);
    const period = await d.menuPeriod(supplier, DATE, DATE);
    const sarma = await d.menuItem(
      period,
      await d.meal(supplier, { name: 'Sarma', type: MealType.Lunch }),
      DATE,
    );
    const window = await d.window(business, {
      menuPeriods: [period],
      targetDates: [DATE],
    });
    await d.selection(window, leftOrdered, DATE, sarma);
    await d.changeRequest({
      window,
      employee: leftLateAddition,
      newMenuItem: sarma,
      newQuantity: 1,
      approvedBy: manager,
    });

    const overview: any = t.get(I_MEAL_SELECTION_OVERVIEW_QUERY_REPOSITORY);
    const items = await overview.getDailyOverview(window.id);
    const byName = Object.fromEntries(
      items.map((i: any) => [i.employeeName, i.status]),
    );

    expect(byName).toEqual({
      Manager: 'no_record',
      'Active, no order': 'no_record',
      'Deactivated, ordered': 'ordered',
      'Deactivated, late addition': 'ordered',
    });
    expect(byName[leftEmpty.name]).toBeUndefined();
    expect(active.businessId).toBe(business.id);
  });
});
