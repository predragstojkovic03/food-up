import { MealType } from '@food-up/shared';
import * as ExcelJS from 'exceljs';
import { bearer } from '../support/auth';
import {
  TestBusiness,
  TestEmployee,
  TestMenuItem,
  TestSupplier,
} from '../support/test-data';
import { createTestApp, TestApp } from '../support/test-app';

/**
 * One full ordering cycle over HTTP, the way the web app drives it:
 * a manager opens a window, employees order, change their mind or skip, a change request is
 * approved after the deadline, and the manager downloads the report and emails the supplier.
 */
describe('Ordering cycle (e2e)', () => {
  const DAY = '2027-03-01'; // a Monday
  const PIXEL_RED = 'FFF8D7DA';
  const GREY = 'FFEDEDED';

  let t: TestApp;
  let business: TestBusiness;
  let manager: TestEmployee;
  let ana: TestEmployee;
  let bob: TestEmployee;
  let cara: TestEmployee;
  let supplier: TestSupplier;
  let sarma: TestMenuItem;
  let cevapi: TestMenuItem;
  let period: { id: string };

  beforeAll(async () => {
    t = await createTestApp();
    await t.reset();
    const d = t.data;
    business = await d.business({ name: 'Acme' });
    manager = await d.manager(business, {
      name: 'Mira Manager',
      email: 'mira@acme.test',
    });
    ana = await d.employee(business, { name: 'Ana' });
    bob = await d.employee(business, { name: 'Bob' });
    cara = await d.employee(business, { name: 'Cara' });
    supplier = await d.managedSupplier(business, {
      name: 'Kitchen',
      email: 'orders@kitchen.test',
    });
    period = await d.menuPeriod(supplier, DAY, DAY);
    sarma = await d.menuItem(
      period,
      await d.meal(supplier, {
        name: 'Sarma',
        type: MealType.Lunch,
        price: 500,
      }),
      DAY,
    );
    cevapi = await d.menuItem(
      period,
      await d.meal(supplier, {
        name: 'Cevapi',
        type: MealType.Lunch,
        price: 600,
      }),
      DAY,
    );
  });

  afterAll(() => t.close());

  const as = (who: TestEmployee) => ({
    get: (path: string) =>
      t.http().get(`/api${path}`).set('Authorization', bearer(who)),
    post: (path: string, body: object) =>
      t.http().post(`/api${path}`).set('Authorization', bearer(who)).send(body),
    patch: (path: string, body: object) =>
      t
        .http()
        .patch(`/api${path}`)
        .set('Authorization', bearer(who))
        .send(body),
  });

  let windowId: string;
  let anaSelectionId: string;

  it('lets the manager open a window for the supplier menu', async () => {
    const created = await as(manager).post('/meal-selection-windows', {
      startTime: new Date(Date.now() - 60_000).toISOString(),
      endTime: new Date(Date.now() + 3_600_000).toISOString(),
      menuPeriodIds: [period.id],
      targetDates: [DAY],
    });
    expect(created.status).toBe(201);
    windowId = created.body.id;

    expect(
      (
        await as(manager).patch(`/meal-selection-windows/${windowId}`, {
          isLocked: false,
        })
      ).status,
    ).toBe(200);

    const current = await as(ana).get('/meal-selection-windows/current');
    expect(current.status).toBe(200);
    expect(current.body.id).toBe(windowId);
    expect(current.body.menuItems.map((m: any) => m.meal.name).sort()).toEqual([
      'Cevapi',
      'Sarma',
    ]);
  });

  it('lets employees order, change their order and skip a day', async () => {
    const anaOrder = await as(ana).post('/meal-selections', {
      mealSelectionWindowId: windowId,
      date: DAY,
      menuItemId: sarma.id,
    });
    expect(anaOrder.status).toBe(201);
    anaSelectionId = anaOrder.body.id;

    const bobOrder = await as(bob).post('/meal-selections', {
      mealSelectionWindowId: windowId,
      date: DAY,
      menuItemId: sarma.id,
    });
    expect(bobOrder.status).toBe(201);
    // Bob changes his mind and skips the day instead
    expect(
      (
        await as(bob).patch(`/meal-selections/${bobOrder.body.id}`, {
          menuItemId: null,
        })
      ).status,
    ).toBe(200);

    const mine = await as(ana).get(`/meal-selections/my/window/${windowId}`);
    expect(mine.body).toEqual([
      expect.objectContaining({ date: DAY, menuItemId: sarma.id }),
    ]);

    // Employees can only change their own selections
    expect(
      (
        await as(ana).patch(`/meal-selections/${bobOrder.body.id}`, {
          menuItemId: cevapi.id,
        })
      ).status,
    ).toBe(404);
  });

  it('does not accept new orders after the deadline', async () => {
    await t.dataSource.query(
      `UPDATE meal_selection_window SET end_time = now() - interval '1 minute' WHERE id = $1`,
      [windowId],
    );

    const late = await as(cara).post('/meal-selections', {
      mealSelectionWindowId: windowId,
      date: DAY,
      menuItemId: sarma.id,
    });
    expect(late.status).toBe(400);
  });

  it('applies a change request once the manager approves it', async () => {
    const request = await as(ana).post('/change-requests', {
      mealSelectionWindowId: windowId,
      mealSelectionId: anaSelectionId,
      newMenuItemId: cevapi.id,
    });
    expect(request.status).toBe(201);

    expect(
      (
        await as(manager).get(
          `/change-requests/window/${windowId}/pending-count`,
        )
      ).body,
    ).toEqual({ count: 1 });
    const approve = await as(manager).patch('/change-requests/bulk-status', {
      items: [{ id: request.body.id, status: 'approved' }],
    });
    expect(approve.status).toBe(200);

    const overview = await as(manager).get(
      `/meal-selections/window/${windowId}/daily-overview`,
    );
    const byName = Object.fromEntries(
      overview.body.map((i: any) => [i.employeeName, i]),
    );
    expect(byName.Ana).toMatchObject({
      status: 'ordered',
      meals: [expect.objectContaining({ name: 'Cevapi' })],
    });
    expect(byName.Bob).toMatchObject({ status: 'skipped', meals: [] });
    expect(byName.Cara).toMatchObject({ status: 'no_record', meals: [] });
  });

  async function downloadReport(): Promise<ExcelJS.Workbook> {
    const res = await as(manager)
      .get(`/reports/export?windowId=${windowId}`)
      .buffer(true)
      .parse((response, callback) => {
        const chunks: Buffer[] = [];
        response.on('data', (c: Buffer) => chunks.push(c));
        response.on('end', () => callback(null, Buffer.concat(chunks)));
      });
    expect(res.status).toBe(200);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(res.body);
    return workbook;
  }

  function dayRows(workbook: ExcelJS.Workbook) {
    const sheet = workbook.worksheets.find((ws) => ws.name !== supplier.name)!;
    const rows: { values: string[]; fill: string | undefined }[] = [];
    sheet.eachRow((row) => {
      rows.push({
        values: (row.values as unknown[]).slice(1).map((v) => String(v ?? '')),
        fill: (row.getCell(1).fill as ExcelJS.FillPattern | undefined)?.fgColor
          ?.argb,
      });
    });
    return { name: sheet.name, header: rows[0].values, rows: rows.slice(1) };
  }

  it('reports the approved order to the supplier in the XLSX', async () => {
    const workbook = await downloadReport();

    const supplierSheet = workbook.getWorksheet(supplier.name)!;
    const mealRows: [string, number][] = [];
    supplierSheet.eachRow((row) => {
      const qty = row.getCell(2).value;
      if (typeof qty === 'number')
        mealRows.push([String(row.getCell(1).value), qty]);
    });
    expect(mealRows).toEqual([['Cevapi', 1]]);

    const day = dayRows(workbook);
    expect(day.rows.map((r) => r.values[0])).toEqual(['Ana']);
    expect(day.rows[0].values[2]).toBe('Cevapi');
  });

  it('lists every employee in the business language when the setting is on', async () => {
    const settings = await as(manager).patch('/businesses/my', {
      language: 'sr',
      reportIncludeEmployeesWithoutSelection: true,
    });
    expect(settings.status).toBe(200);

    const day = dayRows(await downloadReport());
    expect(day.name).toBe('pon 01-03');
    expect(day.header[0]).toBe('Zaposleni');

    const byName = Object.fromEntries(day.rows.map((r) => [r.values[0], r]));
    expect(Object.keys(byName).sort()).toEqual([
      'Ana',
      'Bob',
      'Cara',
      'Mira Manager',
    ]);
    expect(byName.Ana.values[2]).toBe('Cevapi');
    expect(byName.Bob).toMatchObject({ fill: GREY });
    expect(byName.Bob.values[2]).toBe('Preskočeno');
    expect(byName.Cara).toMatchObject({ fill: PIXEL_RED });
    expect(byName['Mira Manager']).toMatchObject({ fill: PIXEL_RED });
  });

  it('emails the order to the supplier and records the send', async () => {
    const preview = await as(manager).get(
      `/reports/preview?windowId=${windowId}&supplierId=${supplier.id}`,
    );
    expect(preview.status).toBe(200);
    expect(preview.body.html).toContain('Cevapi');

    const send = await as(manager).post('/reports/send', {
      windowId,
      suppliers: [
        {
          supplierId: supplier.id,
          subject: preview.body.subject,
          introText: preview.body.introText,
        },
      ],
    });
    expect(send.status).toBe(201);

    const [mail] = t.mail.to('orders@kitchen.test');
    expect(mail).toMatchObject({
      subject: preview.body.subject,
      options: expect.objectContaining({ cc: 'mira@acme.test' }),
    });
    expect(mail.html).toContain('Cevapi');
    expect(mail.html).not.toContain('Sarma');

    const status = await as(manager).get(
      `/reports/send-status?windowId=${windowId}`,
    );
    expect(status.body).toEqual([
      expect.objectContaining({
        supplierId: supplier.id,
        canSend: false,
        lastSentAt: expect.any(String),
      }),
    ]);
  });
});
