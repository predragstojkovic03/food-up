import { Inject, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthGuard } from './core/auth/infrastructure/jwt-auth.guard';
import { CoreModule } from './core/core.module';
import { EmployeeRoleGuard } from './core/employees/presentation/rest/employee-role.guard';
import { IdentityTypeGuard } from './core/identity/presentation/rest/identity-type.guard';
import { EnvironmentVariables } from './env.validation';
import {
  I_CONFIG_SERVICE,
  IConfigService,
} from './shared/application/config-service.interface';
import { DomainEventsModule } from './shared/application/domain-events/domain-events.module';
import { I_LOGGER, ILogger } from './shared/application/logger.interface';
import { ConfigModule } from './shared/infrastructure/config/config.module';
import { DomainExceptionFilter } from './shared/infrastructure/domain-exception-filter';
import { LoggingMiddleware } from './shared/infrastructure/logger/logger.middleware';
import { LoggerModule } from './shared/infrastructure/logger/logger.module';

@Module({
  imports: [
    DomainEventsModule,
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
      inject: [I_CONFIG_SERVICE],
    }),
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '../..', 'client', 'dist'),
    // }),
    LoggerModule,
    CoreModule,
    ConfigModule,
    DomainEventsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: EmployeeRoleGuard,
    },
    {
      provide: APP_GUARD,
      useClass: IdentityTypeGuard,
    },
  ],
})
export class AppModule implements NestModule {
  constructor(@Inject(I_LOGGER) private readonly logger: ILogger) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
