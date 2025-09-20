import { Inject, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { EnvironmentVariables } from './env.validation';
import { IConfigService } from './shared/application/config-service.interface';
import { I_LOGGER, ILogger } from './shared/application/logger.interface';
import { ConfigModule } from './shared/infrastructure/config/config.module';
import { LoggingMiddleware } from './shared/infrastructure/logger/logger.middleware';
import { LoggerModule } from './shared/infrastructure/logger/logger.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (
        configService: IConfigService<EnvironmentVariables, true>,
      ) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: configService.get('ORM_SYNC'),
        entities: [join(__dirname, '**', '*.typeorm-entity.*')],
        namingStrategy: new SnakeNamingStrategy(),
      }),
      inject: [ConfigService],
    }),
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '../..', 'client', 'dist'),
    // }),
    LoggerModule,
    CoreModule,
    ConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  constructor(@Inject(I_LOGGER) private readonly logger: ILogger) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
