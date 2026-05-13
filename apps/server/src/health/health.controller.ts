import { Controller, Get, SerializeOptions } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { Public } from 'src/core/auth/infrastructure/public.decorator';
import { RedisHealthIndicator } from './redis.health-indicator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly _health: HealthCheckService,
    private readonly _db: TypeOrmHealthIndicator,
    private readonly _redis: RedisHealthIndicator,
  ) {}

  @Public
  @Get()
  @HealthCheck()
  @SerializeOptions({ strategy: 'exposeAll' })
  @ApiOperation({ summary: 'Check service health' })
  @ApiResponse({ status: 200, description: 'All checks passed' })
  @ApiResponse({ status: 503, description: 'One or more checks failed' })
  check() {
    return this._health.check([
      () => this._db.pingCheck('database'),
      () => this._redis.isHealthy('redis'),
    ]);
  }
}
