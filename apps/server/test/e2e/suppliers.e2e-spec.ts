import { IdentityType, Language } from '@food-up/shared';
import { bearer } from '../support/auth';
import { TestBusiness, TestEmployee } from '../support/test-data';
import { createTestApp, TestApp } from '../support/test-app';

/**
 * Supplier language decides the language of order emails. Managed suppliers belong to one
 * business, which sets their language. Partner (standalone) suppliers serve several businesses,
 * so their language can't be changed through the supplier record.
 */
describe('Supplier settings (e2e)', () => {
  let t: TestApp;
  let business: TestBusiness;
  let manager: TestEmployee;

  beforeAll(async () => {
    t = await createTestApp();
  });

  afterAll(() => t.close());

  beforeEach(async () => {
    await t.reset();
    business = await t.data.business();
    manager = await t.data.manager(business);
  });

  const patchSupplier = (id: string, auth: string, body: object) =>
    t
      .http()
      .patch(`/api/suppliers/${id}`)
      .set('Authorization', auth)
      .send(body);

  const stored = async (id: string) =>
    (
      await t.dataSource.query(
        `SELECT name, language FROM supplier WHERE id = $1`,
        [id],
      )
    )[0];

  it("lets a manager change a managed supplier's language", async () => {
    const supplier = await t.data.managedSupplier(business, {
      language: Language.En,
    });

    const res = await patchSupplier(supplier.id, bearer(manager), {
      language: Language.Sr,
    });

    expect(res.status).toBe(200);
    expect(await stored(supplier.id)).toMatchObject({ language: Language.Sr });
  });

  it('does not let a basic employee change a managed supplier', async () => {
    const supplier = await t.data.managedSupplier(business, {
      language: Language.En,
    });
    const employee = await t.data.employee(business);

    const res = await patchSupplier(supplier.id, bearer(employee), {
      language: Language.Sr,
    });

    expect([403, 404]).toContain(res.status);
    expect(await stored(supplier.id)).toMatchObject({ language: Language.En });
  });

  it("rejects changing a partner supplier's language", async () => {
    const partner = await t.data.partnerSupplier([business]);

    const res = await patchSupplier(partner.id, bearer(manager), {
      language: Language.Sr,
    });

    expect(res.status).toBe(400);
    expect(await stored(partner.id)).toMatchObject({ language: Language.En });
  });

  it('rejects a partner supplier changing its own language, but allows other updates', async () => {
    const partner = await t.data.partnerSupplier([business], {
      name: 'Old Name',
    });
    const asPartner = bearer({
      identityId: partner.identityId!,
      type: IdentityType.Supplier,
    });

    expect(
      (await patchSupplier(partner.id, asPartner, { language: Language.Sr }))
        .status,
    ).toBe(400);

    const rename = await patchSupplier(partner.id, asPartner, {
      name: 'New Name',
    });
    expect(rename.status).toBe(200);
    expect(await stored(partner.id)).toEqual({
      name: 'New Name',
      language: Language.En,
    });
  });
});
