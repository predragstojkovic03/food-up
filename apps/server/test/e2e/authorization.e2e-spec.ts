import { MealType } from '@food-up/shared';
import { bearer } from '../support/auth';
import { TestEmployee } from '../support/test-data';
import { createTestApp, TestApp } from '../support/test-app';

/**
 * Authorization matrix: who may call what. Business B's resources must be invisible to
 * business A (404), manager-only endpoints must be forbidden to basic employees (403),
 * and nothing in business B may change as a result of A's requests.
 */
describe('Authorization (e2e)', () => {
  let t: TestApp;
  let w: Awaited<ReturnType<typeof buildWorld>>;

  async function buildWorld() {
    const date = '2026-03-02';
    const futureDate = '2026-12-01';
    const d = t.data;

    const bizA = await d.business({ name: 'Business A' });
    const managerA = await d.manager(bizA);
    const basicA = await d.employee(bizA);
    const supplierA = await d.managedSupplier(bizA);
    const mealA = await d.meal(supplierA, { type: MealType.Lunch, price: 500 });
    const periodA = await d.menuPeriod(supplierA, date, date);
    const itemA = await d.menuItem(periodA, mealA, date);
    const windowA = await d.window(bizA, {
      menuPeriods: [periodA],
      targetDates: [date],
    });
    await d.selection(windowA, basicA, date, itemA);

    const bizB = await d.business({ name: 'Business B' });
    const managerB = await d.manager(bizB);
    const basicB = await d.employee(bizB);
    const supplierB = await d.managedSupplier(bizB);
    const mealB = await d.meal(supplierB, { type: MealType.Lunch, price: 700 });
    const mealB2 = await d.meal(supplierB, {
      type: MealType.Lunch,
      price: 800,
    });
    const periodB = await d.menuPeriod(supplierB, date, date);
    const futurePeriodB = await d.menuPeriod(supplierB, futureDate, futureDate);
    const itemB = await d.menuItem(periodB, mealB, date);
    const itemB2 = await d.menuItem(periodB, mealB2, date);
    await d.menuItem(futurePeriodB, mealB, futureDate);
    const windowB = await d.window(bizB, {
      menuPeriods: [periodB],
      targetDates: [date],
    });
    const selectionB = await d.selection(windowB, basicB, date, itemB);
    const crB = await d.changeRequest({
      window: windowB,
      employee: basicB,
      selection: selectionB,
      newMenuItem: itemB2,
      status: 'pending',
    });
    const extraB = await d.extraQuantity(windowB, itemB, 1, 'Guest B');

    const partner = await d.partnerSupplier([bizA]);
    await d.meal(partner, { type: MealType.Soup, price: 200 });

    return {
      date,
      futureDate,
      bizA,
      managerA,
      basicA,
      supplierA,
      mealA,
      periodA,
      itemA,
      windowA,
      bizB,
      managerB,
      basicB,
      supplierB,
      mealB,
      periodB,
      futurePeriodB,
      itemB,
      windowB,
      selectionB,
      crB,
      extraB,
      partner,
    };
  }

  beforeAll(async () => {
    t = await createTestApp();
    await t.reset();
    w = await buildWorld();
  });

  afterAll(() => t.close());

  type Method = 'get' | 'post' | 'patch' | 'delete';
  type Case = [
    label: string,
    actor: () => TestEmployee,
    method: Method,
    path: () => string,
    body: () => object | undefined,
    expected: number | number[],
  ];

  function call(
    actor: TestEmployee,
    method: Method,
    path: string,
    body?: object,
  ) {
    const req = t
      .http()
      [method](`/api${path}`)
      .set('Authorization', bearer(actor));
    return body ? req.send(body) : req;
  }

  function runCases(cases: Case[]) {
    it.each(cases)(
      '%s',
      async (_label, actor, method, path, body, expected) => {
        const res = await call(actor(), method, path(), body());
        const allowed = Array.isArray(expected) ? expected : [expected];
        if (!allowed.includes(res.status)) {
          throw new Error(
            `Expected ${allowed.join(' or ')}, got ${res.status}: ${JSON.stringify(res.body)}`,
          );
        }
      },
    );
  }

  const none = () => undefined;
  const A = () => w.managerA;
  const basic = () => w.basicA;

  describe('basic employees cannot use manager endpoints (403)', () => {
    runCases([
      [
        'list employees',
        basic,
        'get',
        () => `/employees/business/${w.bizA.id}`,
        none,
        403,
      ],
      [
        'promote themselves to manager',
        basic,
        'patch',
        () => `/employees/${w.basicA.id}`,
        () => ({ role: 'manager' }),
        403,
      ],
      [
        'delete their manager',
        basic,
        'delete',
        () => `/employees/${w.managerA.id}`,
        none,
        403,
      ],
      [
        'list invites',
        basic,
        'get',
        () => `/businesses/${w.bizA.id}/invites`,
        none,
        403,
      ],
      [
        'lock a window',
        basic,
        'patch',
        () => `/meal-selection-windows/${w.windowA.id}`,
        () => ({ isLocked: true }),
        403,
      ],
      [
        'delete a window',
        basic,
        'delete',
        () => `/meal-selection-windows/${w.windowA.id}`,
        none,
        403,
      ],
      [
        'see the daily overview',
        basic,
        'get',
        () => `/meal-selections/window/${w.windowA.id}/daily-overview`,
        none,
        403,
      ],
      [
        'see the dashboard',
        basic,
        'get',
        () => `/dashboard/kpis?from=2026-01-01&to=2026-12-31`,
        none,
        403,
      ],
      [
        'list extra quantities',
        basic,
        'get',
        () => `/extra-quantities?windowId=${w.windowA.id}`,
        none,
        403,
      ],
      [
        'download the report',
        basic,
        'get',
        () => `/reports/export?windowId=${w.windowA.id}`,
        none,
        403,
      ],
      [
        'approve change requests',
        basic,
        'patch',
        () => `/change-requests/bulk-status`,
        () => ({ items: [] }),
        403,
      ],
      [
        'create a managed supplier',
        basic,
        'post',
        () => `/suppliers/managed`,
        () => ({ name: 'X', language: 'en' }),
        403,
      ],
      [
        'edit a meal',
        basic,
        'patch',
        () => `/meals/${w.mealA.id}`,
        () => ({ price: 1 }),
        [403, 404],
      ],
      [
        'edit a menu item',
        basic,
        'patch',
        () => `/menu-items/${w.itemA.id}`,
        () => ({ price: 1, day: w.date }),
        [403, 404],
      ],
      [
        'edit a menu period',
        basic,
        'patch',
        () => `/menu-periods/${w.periodA.id}`,
        () => ({ endDate: w.date }),
        [403, 404],
      ],
    ]);
  });

  describe("a manager cannot see or change another business's data (404)", () => {
    runCases([
      [
        'list B employees',
        A,
        'get',
        () => `/employees/business/${w.bizB.id}`,
        none,
        404,
      ],
      [
        'change a B employee',
        A,
        'patch',
        () => `/employees/${w.basicB.id}`,
        () => ({ role: 'manager' }),
        404,
      ],
      [
        'delete a B employee',
        A,
        'delete',
        () => `/employees/${w.basicB.id}`,
        none,
        404,
      ],
      [
        'list B invites',
        A,
        'get',
        () => `/businesses/${w.bizB.id}/invites`,
        none,
        404,
      ],
      [
        'invite into B',
        A,
        'post',
        () => `/businesses/${w.bizB.id}/invites`,
        () => ({ email: 'spy@x.test' }),
        404,
      ],
      [
        'lock a B window',
        A,
        'patch',
        () => `/meal-selection-windows/${w.windowB.id}`,
        () => ({ isLocked: true }),
        404,
      ],
      [
        'delete a B window',
        A,
        'delete',
        () => `/meal-selection-windows/${w.windowB.id}`,
        none,
        404,
      ],
      [
        'read B window menu',
        A,
        'get',
        () => `/meal-selection-windows/${w.windowB.id}/menu-items`,
        none,
        404,
      ],
      [
        'read B selections',
        A,
        'get',
        () => `/meal-selections/window/${w.windowB.id}`,
        none,
        404,
      ],
      [
        'read B daily overview',
        A,
        'get',
        () => `/meal-selections/window/${w.windowB.id}/daily-overview`,
        none,
        404,
      ],
      [
        'read B change requests',
        A,
        'get',
        () => `/change-requests/window/${w.windowB.id}`,
        none,
        404,
      ],
      [
        'count B pending requests',
        A,
        'get',
        () => `/change-requests/window/${w.windowB.id}/pending-count`,
        none,
        404,
      ],
      [
        'approve a B change request',
        A,
        'patch',
        () => `/change-requests/${w.crB.id}/status`,
        () => ({ status: 'approved' }),
        404,
      ],
      [
        'bulk-approve a B change request',
        A,
        'patch',
        () => `/change-requests/bulk-status`,
        () => ({ items: [{ id: w.crB.id, status: 'approved' }] }),
        404,
      ],
      [
        'read B extra quantities',
        A,
        'get',
        () => `/extra-quantities?windowId=${w.windowB.id}`,
        none,
        404,
      ],
      [
        'add a B extra quantity',
        A,
        'post',
        () => `/extra-quantities`,
        () => ({ windowId: w.windowB.id, menuItemId: w.itemB.id, quantity: 5 }),
        404,
      ],
      [
        'remove a B extra quantity',
        A,
        'delete',
        () => `/extra-quantities/${w.extraB.id}`,
        none,
        404,
      ],
      [
        'download the B report',
        A,
        'get',
        () => `/reports/export?windowId=${w.windowB.id}`,
        none,
        404,
      ],
      [
        'read B costs',
        A,
        'get',
        () => `/reports/cost-summary?windowId=${w.windowB.id}`,
        none,
        404,
      ],
      [
        'read B send status',
        A,
        'get',
        () => `/reports/send-status?windowId=${w.windowB.id}`,
        none,
        404,
      ],
      [
        'read B sent emails',
        A,
        'get',
        () => `/reports/sends?windowId=${w.windowB.id}`,
        none,
        404,
      ],
      [
        'preview a B supplier email',
        A,
        'get',
        () =>
          `/reports/preview?windowId=${w.windowB.id}&supplierId=${w.supplierB.id}`,
        none,
        404,
      ],
      [
        'email B suppliers',
        A,
        'post',
        () => `/reports/send`,
        () => ({
          windowId: w.windowB.id,
          suppliers: [
            { supplierId: w.supplierB.id, subject: 'x', introText: 'x' },
          ],
        }),
        404,
      ],
      [
        'read B meals',
        A,
        'get',
        () => `/meals/supplier/${w.supplierB.id}`,
        none,
        404,
      ],
      [
        'edit a B meal',
        A,
        'patch',
        () => `/meals/${w.mealB.id}`,
        () => ({ price: 1 }),
        404,
      ],
      ['delete a B meal', A, 'delete', () => `/meals/${w.mealB.id}`, none, 404],
      [
        'read B menu periods',
        A,
        'get',
        () => `/menu-periods/supplier/${w.supplierB.id}`,
        none,
        404,
      ],
      [
        'edit a B menu period',
        A,
        'patch',
        () => `/menu-periods/${w.periodB.id}`,
        () => ({ endDate: w.date }),
        404,
      ],
      [
        'delete a B menu period',
        A,
        'delete',
        () => `/menu-periods/${w.futurePeriodB.id}`,
        none,
        404,
      ],
      [
        'read B menu items',
        A,
        'get',
        () => `/menu-items/menu-period/${w.periodB.id}`,
        none,
        404,
      ],
      [
        'add a B menu item',
        A,
        'post',
        () => `/menu-items`,
        () => ({ menuPeriodId: w.periodB.id, mealId: w.mealB.id, day: w.date }),
        404,
      ],
      [
        'edit a B menu item',
        A,
        'patch',
        () => `/menu-items/${w.itemB.id}`,
        () => ({ price: 1, day: w.date }),
        404,
      ],
      [
        'delete a B menu item',
        A,
        'delete',
        () => `/menu-items/${w.itemB.id}`,
        none,
        404,
      ],
      [
        'delete a B supplier',
        A,
        'delete',
        () => `/suppliers/${w.supplierB.id}`,
        none,
        404,
      ],
      [
        'rename a B supplier',
        A,
        'patch',
        () => `/suppliers/${w.supplierB.id}`,
        () => ({ name: 'Hacked' }),
        [403, 404],
      ],
    ]);
  });

  describe('employees cannot act on another business', () => {
    runCases([
      [
        'read B window menu',
        basic,
        'get',
        () => `/meal-selection-windows/${w.windowB.id}/menu-items`,
        none,
        404,
      ],
      [
        'order in a B window',
        basic,
        'post',
        () => `/meal-selections`,
        () => ({
          mealSelectionWindowId: w.windowB.id,
          date: w.date,
          menuItemId: w.itemB.id,
        }),
        404,
      ],
      [
        'file a change request in a B window',
        basic,
        'post',
        () => `/change-requests`,
        () => ({
          mealSelectionWindowId: w.windowB.id,
          newMenuItemId: w.itemB.id,
          newQuantity: 1,
        }),
        404,
      ],
    ]);
  });

  describe('windows can only use menus of suppliers available to the business', () => {
    runCases([
      [
        'create a window from a B menu',
        A,
        'post',
        () => `/meal-selection-windows`,
        () => ({
          startTime: new Date(Date.now() + 3_600_000).toISOString(),
          endTime: new Date(Date.now() + 7_200_000).toISOString(),
          menuPeriodIds: [w.futurePeriodB.id],
          targetDates: [w.futureDate],
        }),
        400,
      ],
    ]);
  });

  describe('normal access still works', () => {
    runCases([
      [
        'manager lists own employees',
        A,
        'get',
        () => `/employees/business/${w.bizA.id}`,
        none,
        200,
      ],
      [
        'manager reads own daily overview',
        A,
        'get',
        () => `/meal-selections/window/${w.windowA.id}/daily-overview`,
        none,
        200,
      ],
      [
        'manager reads own costs',
        A,
        'get',
        () => `/reports/cost-summary?windowId=${w.windowA.id}`,
        none,
        200,
      ],
      [
        'manager downloads own report',
        A,
        'get',
        () => `/reports/export?windowId=${w.windowA.id}`,
        none,
        200,
      ],
      [
        'manager reads own supplier meals',
        A,
        'get',
        () => `/meals/supplier/${w.supplierA.id}`,
        none,
        200,
      ],
      [
        'manager reads partner supplier meals',
        A,
        'get',
        () => `/meals/supplier/${w.partner.id}`,
        none,
        200,
      ],
      [
        'manager reads own menu items',
        A,
        'get',
        () => `/menu-items/menu-period/${w.periodA.id}`,
        none,
        200,
      ],
      [
        'manager sees the dashboard',
        A,
        'get',
        () => `/dashboard/kpis?from=2026-01-01&to=2026-12-31`,
        none,
        200,
      ],
      [
        'employee reads own window menu',
        basic,
        'get',
        () => `/meal-selection-windows/${w.windowA.id}/menu-items`,
        none,
        200,
      ],
      [
        'employee reads own selections',
        basic,
        'get',
        () => `/meal-selections/my/window/${w.windowA.id}`,
        none,
        200,
      ],
    ]);
  });

  describe('list-everything endpoints are gone', () => {
    runCases(
      [
        '/businesses',
        '/meal-selection-windows',
        '/meal-selections',
        '/change-requests',
        '/meals',
        '/menu-items',
        '/menu-periods',
        '/suppliers',
      ].map((path): Case => [`GET ${path}`, A, 'get', () => path, none, 404]),
    );
  });

  it("left business B's data untouched", async () => {
    const q = async (sql: string, params: unknown[]) =>
      (await t.dataSource.query(sql, params))[0];

    expect(
      await q(`SELECT role FROM employee WHERE id = $1`, [w.basicB.id]),
    ).toEqual({ role: 'basic' });
    expect(
      await q(`SELECT is_locked FROM meal_selection_window WHERE id = $1`, [
        w.windowB.id,
      ]),
    ).toEqual({ is_locked: false });
    expect(
      await q(`SELECT status FROM change_request WHERE id = $1`, [w.crB.id]),
    ).toEqual({ status: 'pending' });
    expect(
      await q(`SELECT price::float FROM meal WHERE id = $1`, [w.mealB.id]),
    ).toEqual({ price: 700 });
    expect(
      await q(`SELECT name FROM supplier WHERE id = $1`, [w.supplierB.id]),
    ).toEqual({ name: w.supplierB.name });
    expect(
      await q(
        `SELECT COUNT(*)::int AS n FROM extra_quantity WHERE window_id = $1`,
        [w.windowB.id],
      ),
    ).toEqual({ n: 1 });
    expect(
      await q(
        `SELECT COUNT(*)::int AS n FROM menu_item WHERE menu_period_id = $1`,
        [w.periodB.id],
      ),
    ).toEqual({ n: 2 });
    expect(
      await q(
        `SELECT COUNT(*)::int AS n FROM business_invite WHERE business_id = $1`,
        [w.bizB.id],
      ),
    ).toEqual({ n: 0 });
    expect(
      t.mail.sent.filter((m) => m.to.endsWith('@supplier.test')),
    ).toHaveLength(0);
  });
});
