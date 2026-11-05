import { MealType } from '@food-up/shared';
import { MealSelectionsService } from 'src/core/meal-selections/application/meal-selections.service';
import { createTestApp, TestApp } from '../support/test-app';

describe('Meal selection persistence (integration)', () => {
  const DAY = '2027-03-01';
  let t: TestApp;

  beforeAll(async () => {
    t = await createTestApp();
  });

  afterAll(() => t.close());

  async function openWindowWithOrder() {
    await t.reset();
    const d = t.data;
    const business = await d.business();
    const employee = await d.employee(business);
    const supplier = await d.managedSupplier(business);
    const period = await d.menuPeriod(supplier, DAY, DAY);
    const sarma = await d.menuItem(
      period,
      await d.meal(supplier, {
        name: 'Sarma',
        type: MealType.Lunch,
        price: 500,
      }),
      DAY,
    );
    const cevapi = await d.menuItem(
      period,
      await d.meal(supplier, {
        name: 'Cevapi',
        type: MealType.Lunch,
        price: 600,
      }),
      DAY,
    );
    const window = await d.window(business, {
      menuPeriods: [period],
      targetDates: [DAY],
      startTime: new Date(Date.now() - 3_600_000),
      endTime: new Date(Date.now() + 3_600_000),
    });
    const selection = await d.selection(window, employee, DAY, sarma);
    return { employee, selection, cevapi };
  }

  const stored = async (id: string) =>
    (
      await t.dataSource.query(
        `SELECT menu_item_id, price::float AS price, quantity FROM meal_selection WHERE id = $1`,
        [id],
      )
    )[0];

  it('records a skip when the meal is changed to none', async () => {
    const { employee, selection } = await openWindowWithOrder();

    await t
      .get(MealSelectionsService)
      .update(selection.id, employee.identityId, { menuItemId: null });

    expect(await stored(selection.id)).toMatchObject({
      menu_item_id: null,
      price: null,
    });
  });

  it('switches to another meal and captures its price', async () => {
    const { employee, selection, cevapi } = await openWindowWithOrder();

    await t
      .get(MealSelectionsService)
      .update(selection.id, employee.identityId, { menuItemId: cevapi.id });

    expect(await stored(selection.id)).toMatchObject({
      menu_item_id: cevapi.id,
      price: 600,
    });
  });
});
