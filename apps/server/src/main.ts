import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'node:path';
import { AppModule } from './app.module';
import { EnvironmentVariables, NodeEnv } from './env.validation';
import {
  I_CONFIG_SERVICE,
  IConfigService,
} from './shared/application/config-service.interface';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

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

  const config = new DocumentBuilder()
    .setTitle('Food Up API')
    .setDescription('API documentation for Food Up')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const configService =
    app.get<IConfigService<EnvironmentVariables, true>>(I_CONFIG_SERVICE);
  const isProduction = configService.get('NODE_ENV') === NodeEnv.Production;

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      supportedSubmitMethods: isProduction
        ? []
        : ['get', 'post', 'put', 'patch', 'delete'],
    },
  });

  await app.listen(3000);
}
bootstrap();
