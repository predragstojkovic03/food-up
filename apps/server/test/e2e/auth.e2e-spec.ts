import { bearer } from '../support/auth';
import { TEST_PASSWORD, TestBusiness, TestEmployee } from '../support/test-data';
import { createTestApp, TestApp } from '../support/test-app';

function refreshCookie(res: { headers: Record<string, unknown> }): string {
  const cookies = (res.headers['set-cookie'] as string[] | undefined) ?? [];
  const cookie = cookies.find((c) => c.startsWith('refresh_token='));
  if (!cookie) throw new Error('No refresh_token cookie set');
  return cookie.split(';')[0];
}

describe('Authentication (e2e)', () => {
  let t: TestApp;
  let business: TestBusiness;
  let employee: TestEmployee;

  beforeAll(async () => {
    t = await createTestApp();
  });

  afterAll(() => t.close());

  beforeEach(async () => {
    await t.reset();
    business = await t.data.business();
    employee = await t.data.employee(business);
  });

  const login = (email: string, password: string) =>
    t.http().post('/api/auth/login').send({ email, password });

  /** Login succeeded (any 2xx with a token); the exact status code has its own test. */
  const loggedIn = (res: { status: number; body: { access_token?: string } }) =>
    res.status >= 200 && res.status < 300 && typeof res.body.access_token === 'string';

  describe('login', () => {
    it('returns an access token and sets an httpOnly refresh cookie (200, as documented)', async () => {
      const res = await login(employee.email, TEST_PASSWORD);

      expect(res.status).toBe(200);
      expect(res.body.access_token).toEqual(expect.any(String));
      const raw = (res.headers['set-cookie'] as unknown as string[]).find((c) => c.startsWith('refresh_token='));
      expect(raw).toMatch(/HttpOnly/i);
    });

    it('rejects a wrong password or unknown email with 401', async () => {
      expect((await login(employee.email, 'wrong-password')).status).toBe(401);
      expect((await login('nobody@example.test', TEST_PASSWORD)).status).toBe(401);
    });

    it('does not let a deactivated employee log in', async () => {
      const inactive = await t.data.employee(business, { active: false });
      const res = await login(inactive.email, TEST_PASSWORD);
      expect([401, 403]).toContain(res.status);
      expect(res.body.access_token).toBeUndefined();
    });

    it('ends the session of an employee who is deactivated after logging in', async () => {
      const cookie = refreshCookie(await login(employee.email, TEST_PASSWORD));
      await t.dataSource.query(`UPDATE identity SET is_active = false WHERE id = $1`, [employee.identityId]);

      const res = await t.http().post('/api/auth/refresh').set('Cookie', cookie);
      expect([401, 403]).toContain(res.status);
    });
  });

  describe('session', () => {
    it('identifies the caller on /auth/me', async () => {
      const res = await t.http().get('/api/auth/me').set('Authorization', bearer(employee));
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ id: employee.identityId, businessId: business.id });
    });

    it('rejects requests without a valid access token with 401', async () => {
      expect((await t.http().get('/api/auth/me')).status).toBe(401);
      expect((await t.http().get('/api/auth/me').set('Authorization', 'Bearer not-a-jwt')).status).toBe(401);
    });

    it('rotates the refresh token on refresh', async () => {
      const first = refreshCookie(await login(employee.email, TEST_PASSWORD));

      const res = await t.http().post('/api/auth/refresh').set('Cookie', first);
      expect(res.status).toBe(200);
      expect(res.body.access_token).toEqual(expect.any(String));
      expect(refreshCookie(res)).not.toBe(first);
    });

    it('revokes the whole session when a used refresh token is presented again', async () => {
      const first = refreshCookie(await login(employee.email, TEST_PASSWORD));
      const second = refreshCookie(await t.http().post('/api/auth/refresh').set('Cookie', first));

      expect((await t.http().post('/api/auth/refresh').set('Cookie', first)).status).toBe(401);
      // The legitimate successor is revoked too, since the token family was compromised
      expect((await t.http().post('/api/auth/refresh').set('Cookie', second)).status).toBe(401);
    });

    it('ends the session on logout', async () => {
      const cookie = refreshCookie(await login(employee.email, TEST_PASSWORD));

      expect((await t.http().post('/api/auth/logout').set('Cookie', cookie)).status).toBe(204);
      expect((await t.http().post('/api/auth/refresh').set('Cookie', cookie)).status).toBe(401);
    });
  });

  describe('change password', () => {
    const changePassword = (currentPassword: string, newPassword: string) =>
      t
        .http()
        .post('/api/auth/change-password')
        .set('Authorization', bearer(employee))
        .send({ currentPassword, newPassword });

    it('rejects an incorrect current password (401, as documented)', async () => {
      expect((await changePassword('wrong-password', 'new-password-1')).status).toBe(401);
      expect(loggedIn(await login(employee.email, TEST_PASSWORD))).toBe(true);
    });

    it('changes the password so only the new one works', async () => {
      expect((await changePassword(TEST_PASSWORD, 'new-password-1')).status).toBe(204);
      expect(loggedIn(await login(employee.email, 'new-password-1'))).toBe(true);
      expect((await login(employee.email, TEST_PASSWORD)).status).toBe(401);
    });
  });
});
