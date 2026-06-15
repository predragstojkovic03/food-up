import './instrumentation';

import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { Logger } from 'nestjs-pino';
import { join } from 'node:path';
import { AppModule } from './app.module';
import { EnvironmentVariables, NodeEnv } from './env.validation';
import {
  I_CONFIG_SERVICE,
  IConfigService,
} from './shared/application/config-service.interface';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));

  const configService =
    app.get<IConfigService<EnvironmentVariables, true>>(I_CONFIG_SERVICE);
  const isProduction = configService.get('NODE_ENV') === NodeEnv.Production;

  /**
   * cookie-parser makes req.cookies available so controllers can read the httpOnly
   * refresh token cookie without manual header parsing.
   */
  app.use(cookieParser());

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

  if (!isProduction) {
    const config = new DocumentBuilder()
      .setTitle('Food Up API')
      .setDescription('API documentation for Food Up')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        supportedSubmitMethods: ['get', 'post', 'put', 'patch', 'delete'],
      },
    });
  }

  await app.listen(3000);
}
bootstrap();
