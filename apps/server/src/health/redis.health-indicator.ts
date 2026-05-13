import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import Redis from 'ioredis';
import { EnvironmentVariables } from 'src/env.validation';
import {
  I_CONFIG_SERVICE,
  IConfigService,
} from 'src/shared/application/config-service.interface';

@Injectable()
export class RedisHealthIndicator implements OnModuleDestroy, OnModuleInit {
  private readonly _client: Redis;

  constructor(
    private readonly _healthIndicatorService: HealthIndicatorService,
    @Inject(I_CONFIG_SERVICE)
    configService: IConfigService<EnvironmentVariables, true>,
  ) {
    this._client = new Redis({
      host: configService.get('REDIS_HOST'),
      port: configService.get('REDIS_PORT'),
      lazyConnect: true,
      enableOfflineQueue: false,
    });
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const indicator = this._healthIndicatorService.check(key);
    try {
      await this._client.ping();
      return indicator.up();
    } catch (err) {
      return indicator.down({ message: (err as Error).message });
    }
  }

  onModuleDestroy(): void {
    this._client.disconnect();
  }

  async onModuleInit(): Promise<void> {
    await this._client.connect();
  }
}
