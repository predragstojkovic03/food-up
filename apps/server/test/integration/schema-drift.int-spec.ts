import { createTestApp, TestApp } from '../support/test-app';

/**
 * Production builds its schema from apps/server/migrations, while development often uses
 * ORM_SYNC. If an entity changes without a matching migration, production would differ from
 * what the code expects. The database here is built from the migrations, so TypeORM must find
 * nothing left to change.
 */
describe('Schema built from migrations (integration)', () => {
  let t: TestApp;

  beforeAll(async () => {
    t = await createTestApp();
  });

  afterAll(() => t.close());

  it('matches the TypeORM entities exactly', async () => {
    const pending = await t.dataSource.driver.createSchemaBuilder().log();
    expect(pending.upQueries.map((q) => q.query)).toEqual([]);
  });
});
