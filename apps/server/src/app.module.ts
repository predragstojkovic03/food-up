import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { trace } from '@opentelemetry/api';
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
import { ConfigModule } from './shared/infrastructure/config/config.module';
import { TransactionModule } from './shared/infrastructure/transaction/transaction.module';
import { DomainExceptionFilter } from './shared/infrastructure/domain-exception-filter';
import { DisabledEndpointGuard } from './shared/infrastructure/guards/disabled-endpoint.guard';
import { LoggerModule } from './shared/infrastructure/logger/logger.module';
import { NotificationsModule } from './shared/infrastructure/notifications/notifications.module';

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        autoLogging: true,
        customReceivedMessage: (req) => `Request ${req.method} ${req.url}`,
        customSuccessMessage: (req, res, responseTime) =>
          `Response ${req.method} ${res.statusCode} | ${Math.round((responseTime as number) * 100) / 100} [ms]`,
        customErrorMessage: (_req, res, err) =>
          `Response ${res.statusCode} | ERROR: ${err.message}`,
        customProps: (req) => {
          const expressReq = req as unknown as Record<string, unknown>;
          return {
            ...(expressReq['body'] &&
            Object.keys(expressReq['body'] as object).length > 0
              ? { body: expressReq['body'] }
              : {}),
            ...(expressReq['query'] &&
            Object.keys(expressReq['query'] as object).length > 0
              ? { query: expressReq['query'] }
              : {}),
          };
        },
        formatters: {
          level: (label: string) => ({ level: label }),
        },
        mixin() {
          const span = trace.getActiveSpan();
          if (!span) return {};
          const { traceId, spanId } = span.spanContext();
          return { traceId, spanId };
        },
      },
    }),
    EventEmitterModule.forRoot({ wildcard: true }),
    BullModule.forRootAsync({
      useFactory: (configService: IConfigService<EnvironmentVariables, true>) => ({
        connection: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        },
      }),
      inject: [I_CONFIG_SERVICE],
    }),
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
        logging: false,
      }),
      inject: [I_CONFIG_SERVICE],
    }),
    LoggerModule,
    TransactionModule,
    CoreModule,
    ConfigModule,
    NotificationsModule,
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
    {
      provide: APP_GUARD,
      useClass: DisabledEndpointGuard,
    },
  ],
})
export class AppModule {}
