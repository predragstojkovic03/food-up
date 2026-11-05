import { TEST_ADMIN_API_KEY } from '../setup/global-setup';
import { bearer } from '../support/auth';
import { TEST_PASSWORD } from '../support/test-data';
import { createTestApp, TestApp } from '../support/test-app';

describe('Business onboarding and employee invites (e2e)', () => {
  let t: TestApp;

  beforeAll(async () => {
    t = await createTestApp();
  });

  afterAll(() => t.close());

  beforeEach(() => t.reset());

  const loggedIn = (res: { status: number; body: { access_token?: string } }) =>
    res.status >= 200 && res.status < 300 && typeof res.body.access_token === 'string';

  describe('POST /admin/businesses', () => {
    const body = {
      name: 'Acme',
      contactEmail: 'office@acme.test',
      manager: { name: 'Jane', email: 'jane@acme.test', password: 'secret123' },
    };
    const onboard = (payload: object, apiKey?: string) => {
      const req = t.http().post('/api/admin/businesses').send(payload);
      return apiKey === undefined ? req : req.set('X-Api-Key', apiKey);
    };

    it('creates the business and a manager who can log in and manage it', async () => {
      const res = await onboard(body, TEST_ADMIN_API_KEY);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        business: { name: 'Acme', contactEmail: 'office@acme.test' },
        manager: { name: 'Jane', email: 'jane@acme.test' },
      });

      const login = await t.http().post('/api/auth/login').send({ email: 'jane@acme.test', password: 'secret123' });
      expect(loggedIn(login)).toBe(true);

      const my = await t.http().get('/api/businesses/my').set('Authorization', `Bearer ${login.body.access_token}`);
      expect(my.status).toBe(200);
      expect(my.body.id).toBe(res.body.business.id);
    });

    it('requires the API key', async () => {
      expect((await onboard(body)).status).toBe(401);
      expect((await onboard(body, 'wrong-key')).status).toBe(401);
    });

    it('cannot be called with a user session instead of the API key', async () => {
      const business = await t.data.business();
      const manager = await t.data.manager(business);
      const res = await t.http().post('/api/admin/businesses').set('Authorization', bearer(manager)).send(body);
      expect(res.status).toBe(401);
    });

    it('validates the request body', async () => {
      const res = await onboard({ ...body, manager: { ...body.manager, password: '123' } }, TEST_ADMIN_API_KEY);
      expect(res.status).toBe(400);
    });

    it('rejects duplicates with 409 and creates nothing when the manager email is taken', async () => {
      expect((await onboard(body, TEST_ADMIN_API_KEY)).status).toBe(201);

      expect((await onboard({ ...body, contactEmail: 'other@acme.test' }, TEST_ADMIN_API_KEY)).status).toBe(409);
      expect((await onboard({ ...body, name: 'Other' }, TEST_ADMIN_API_KEY)).status).toBe(409);

      const res = await onboard(
        { name: 'Beta', contactEmail: 'office@beta.test', manager: body.manager },
        TEST_ADMIN_API_KEY,
      );
      expect(res.status).toBe(409);
      // All-or-nothing: the business must not exist without its manager
      const [{ count }] = await t.dataSource.query(`SELECT COUNT(*)::int AS count FROM business WHERE name = 'Beta'`);
      expect(count).toBe(0);
    });

    it('no longer exposes the old public POST /businesses', async () => {
      const res = await t.http().post('/api/businesses').send({ name: 'X', contactEmail: 'x@x.test' });
      expect([401, 404]).toContain(res.status);
    });
  });

  describe('invites', () => {
    async function inviteFor(email: string) {
      const business = await t.data.business();
      const manager = await t.data.manager(business);
      const res = await t
        .http()
        .post(`/api/businesses/${business.id}/invites`)
        .set('Authorization', bearer(manager))
        .send({ email });
      expect(res.status).toBe(201);
      return { business, manager, token: res.body.token as string };
    }

    const register = (email: string, inviteToken: string) =>
      t.http().post('/api/employees/register').send({ name: 'New Person', email, password: TEST_PASSWORD, inviteToken });

    it('emails the invite and lets the invited person join the business', async () => {
      const { business, token } = await inviteFor('new.person@acme.test');

      const [mail] = t.mail.to('new.person@acme.test');
      expect(mail).toBeDefined();
      expect(mail.html).toContain(token);

      expect((await t.http().get(`/api/businesses/invites/validate?token=${token}`)).body).toEqual({
        email: 'new.person@acme.test',
      });

      expect((await register('new.person@acme.test', token)).status).toBe(201);
      const login = await t.http().post('/api/auth/login').send({ email: 'new.person@acme.test', password: TEST_PASSWORD });
      expect(loggedIn(login)).toBe(true);
      const me = await t.http().get('/api/auth/me').set('Authorization', `Bearer ${login.body.access_token}`);
      expect(me.body).toMatchObject({ businessId: business.id, role: 'basic' });
    });

    it('can only be used once', async () => {
      const { token } = await inviteFor('once@acme.test');
      expect((await register('once@acme.test', token)).status).toBe(201);
      expect((await register('once@acme.test', token)).status).toBeGreaterThanOrEqual(400);
    });

    it('can only be used for the invited email address', async () => {
      const { token } = await inviteFor('invited@acme.test');
      const res = await register('someone.else@acme.test', token);
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    });

    it('cannot be used after it expires', async () => {
      const { token } = await inviteFor('late@acme.test');
      await t.dataSource.query(`UPDATE business_invite SET expires_at = now() - interval '1 day' WHERE token = $1`, [
        token,
      ]);
      expect((await t.http().get(`/api/businesses/invites/validate?token=${token}`)).body).toEqual({});
      expect((await register('late@acme.test', token)).status).toBeGreaterThanOrEqual(400);
    });
  });
});
