import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { RedisContainer } from '@testcontainers/redis';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Client } from 'pg';

export const TEST_JWT_SECRET = 'test-jwt-secret';
export const TEST_ADMIN_API_KEY = 'test-admin-api-key';

/**
 * Starts throwaway Postgres and Redis containers for the whole test run and builds the
 * schema from the real migrations, the same files golang-migrate applies in production.
 */
export default async function globalSetup(): Promise<void> {
  const [postgres, redis] = await Promise.all([
    new PostgreSqlContainer('postgres:17.4-alpine').start(),
    new RedisContainer('redis:8-alpine').start(),
  ]);

  await applyMigrations(postgres.getConnectionUri());

  Object.assign(process.env, {
    // Deliberately not UTC: calendar dates must not shift with the server's timezone
    TZ: process.env.TEST_TZ ?? 'Europe/Belgrade',
    NODE_ENV: 'development',
    LOG_LEVEL: 'silent',
    DISABLE_THROTTLE: 'true',
    ORM_SYNC: 'false',
    DB_HOST: postgres.getHost(),
    DB_PORT: String(postgres.getPort()),
    DB_USER: postgres.getUsername(),
    DB_PASSWORD: postgres.getPassword(),
    DB_NAME: postgres.getDatabase(),
    REDIS_HOST: redis.getHost(),
    REDIS_PORT: String(redis.getPort()),
    WEB_APP_URL: 'http://localhost:5000',
    MAIL_FROM: 'test@food-up.local',
    RESEND_API_KEY: 'test-resend-key',
    JWT_SECRET: TEST_JWT_SECRET,
    JWT_ACCESS_EXPIRY: '15m',
    JWT_REFRESH_EXPIRY_DAYS: '7',
    GOOGLE_CLIENT_ID: 'test-google-client-id',
    GOOGLE_CLIENT_SECRET: 'test-google-client-secret',
    GOOGLE_CALLBACK_URL: 'http://localhost:3000/api/auth/google/callback',
    ADMIN_API_KEY: TEST_ADMIN_API_KEY,
  });

  (globalThis as Record<string, unknown>).__TEST_CONTAINERS__ = [postgres, redis];
}

async function applyMigrations(connectionUri: string): Promise<void> {
  const dir = join(__dirname, '..', '..', 'migrations');
  const files = readdirSync(dir)
    .filter((f) => f.endsWith('.up.sql'))
    .sort();

  // One connection for all migrations, like `migrate up` in production, so session settings
  // leaking from one migration into the next are caught here too
  const client = new Client({ connectionString: connectionUri });
  await client.connect();
  try {
    for (const file of files) {
      await client.query(readFileSync(join(dir, file), 'utf8'));
    }
  } finally {
    await client.end();
  }
}
