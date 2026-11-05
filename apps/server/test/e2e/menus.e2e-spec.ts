import { MealType } from '@food-up/shared';
import { bearer } from '../support/auth';
import { createTestApp, TestApp } from '../support/test-app';

describe('Supplier menus (e2e)', () => {
  let t: TestApp;

  beforeAll(async () => {
    t = await createTestApp();
  });

  afterAll(() => t.close());

  beforeEach(() => t.reset());

  async function menu() {
    const business = await t.data.business();
    const manager = await t.data.manager(business);
    const supplier = await t.data.managedSupplier(business);
    const period = await t.data.menuPeriod(supplier, '2027-03-01', '2027-03-05');
    const item = await t.data.menuItem(period, await t.data.meal(supplier, { type: MealType.Lunch, price: 500 }), '2027-03-01');
    return { manager, item };
  }

  const stored = async (id: string) =>
    (await t.dataSource.query(`SELECT price::float AS price, day::text AS day FROM menu_item WHERE id = $1`, [id]))[0];

  it('updates only the price of a menu item (day is optional, as documented)', async () => {
    const { manager, item } = await menu();

    const res = await t.http().patch(`/api/menu-items/${item.id}`).set('Authorization', bearer(manager)).send({ price: 650 });

    expect(res.status).toBe(200);
    expect(await stored(item.id)).toEqual({ price: 650, day: '2027-03-01' });
  });

  it('moves a menu item to another day', async () => {
    const { manager, item } = await menu();

    const res = await t.http().patch(`/api/menu-items/${item.id}`).set('Authorization', bearer(manager)).send({ day: '2027-03-02' });

    expect(res.status).toBe(200);
    expect(await stored(item.id)).toEqual({ price: 500, day: '2027-03-02' });
  });
});
