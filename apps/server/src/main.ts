import './instrumentation';

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';
import {
  API_KEY_HEADER,
  API_KEY_SECURITY_NAME,
} from './core/auth/infrastructure/api-key-protected.decorator';
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

  configureApp(app);

  if (!isProduction) {
    const config = new DocumentBuilder()
      .setTitle('Food Up API')
      .setDescription('API documentation for Food Up')
      .setVersion('1.0')
      .addBearerAuth()
      .addApiKey(
        { type: 'apiKey', name: API_KEY_HEADER, in: 'header' },
        API_KEY_SECURITY_NAME,
      )
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
