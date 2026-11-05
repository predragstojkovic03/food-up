import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { join } from 'node:path';
import { EnvironmentVariables } from './env.validation';
import {
  I_CONFIG_SERVICE,
  IConfigService,
} from './shared/application/config-service.interface';

/**
 * HTTP-level configuration shared by main.ts and the end-to-end tests,
 * so tests exercise the same pipes, serialization and routing as production.
 */
export function configureApp(app: NestExpressApplication): void {
  const configService =
    app.get<IConfigService<EnvironmentVariables, true>>(I_CONFIG_SERVICE);

  /**
   * cookie-parser makes req.cookies available so controllers can read the httpOnly
   * refresh token cookie without manual header parsing.
   */
  app.use(cookieParser());

  // Trust one hop of proxy (Nginx / ALB) so ThrottlerGuard reads the real client IP
  // from X-Forwarded-For rather than the proxy's IP address.
  app.set('trust proxy', 1);

  /**
   * credentials: true is required for the browser to send cookies on cross-origin requests
   * (e.g. frontend on :5000, backend on :3000 during development).
   * Without this, fetch(..., { credentials: 'include' }) would not attach the refresh cookie.
   */
  app.enableCors({
    origin: configService.get('WEB_APP_URL'),
    credentials: true,
  });

  app.useStaticAssets(join(__dirname, '..', 'public'), {
    index: false,
    prefix: '/public',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      strategy: 'excludeAll',
    }),
  );

  app.setGlobalPrefix('api');
}
