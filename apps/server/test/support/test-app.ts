import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { configureApp } from 'src/app.setup';
import { I_MAIL_SERVICE } from 'src/shared/application/mail/mail.service.interface';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { FakeMailService } from './fake-mail.service';
import { TestData } from './test-data';

export interface TestApp {
  app: NestExpressApplication;
  http: () => request.SuperTest<request.Test>;
  dataSource: DataSource;
  data: TestData;
  mail: FakeMailService;
  /** Resolves any provider (including DI symbols) from anywhere in the module graph. */
  get<T>(token: string | symbol | (abstract new (...args: never[]) => T)): T;
  reset(): Promise<void>;
  close(): Promise<void>;
}

/** Boots the real AppModule (real Postgres + Redis containers), with email sending faked. */
export async function createTestApp(): Promise<TestApp> {
  const mail = new FakeMailService();
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(I_MAIL_SERVICE)
    .useValue(mail)
    .compile();

  const app = moduleRef.createNestApplication<NestExpressApplication>({
    logger: false,
  });
  configureApp(app);
  await app.init();

  const dataSource = app.get(DataSource);
  const data = new TestData(dataSource);

  return {
    app,
    http: () =>
      request(
        app.getHttpServer(),
      ) as unknown as request.SuperTest<request.Test>,
    dataSource,
    data,
    mail,
    get: <T>(token: string | symbol | (abstract new (...args: never[]) => T)) =>
      app.get<T>(token as never, { strict: false }),
    reset: async () => {
      await truncateAll(dataSource);
      mail.clear();
    },
    close: () => app.close(),
  };
}

async function truncateAll(dataSource: DataSource): Promise<void> {
  const tables: { tablename: string }[] = await dataSource.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public'`,
  );
  if (tables.length === 0) return;
  await dataSource.query(
    `TRUNCATE ${tables.map((t) => `public."${t.tablename}"`).join(', ')} RESTART IDENTITY CASCADE`,
  );
}
