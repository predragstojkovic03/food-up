import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesModule } from '../employees/employees.module';
import { IdentityModule } from '../identity/identity.module';
import { AuthService } from './application/auth.service';
import { I_REFRESH_TOKEN_REPOSITORY } from './domain/refresh-token.repository.interface';
import { JwtAuthGuard } from './infrastructure/jwt-auth.guard';
import { JwtStrategy } from './infrastructure/jwt.strategy';
import { LocalAuthGuard } from './infrastructure/local-auth.guard';
import { LocalStrategy } from './infrastructure/local.strategy';
import { RefreshTokenTypeOrmRepository } from './infrastructure/persistence/refresh-token-typeorm.repository';
import { RefreshTokenTypeOrmEntity } from './infrastructure/persistence/refresh-token.typeorm-entity';
import { AuthController } from './presentation/rest/auth.controller';
import {
  I_CONFIG_SERVICE,
  IConfigService,
} from 'src/shared/application/config-service.interface';
import { EnvironmentVariables } from 'src/env.validation';
import { ConfigModule } from 'src/shared/infrastructure/config/config.module';

@Module({
  imports: [
    PassportModule,
    /**
     * WHY registerAsync instead of register:
     * We need to read JWT_SECRET from the environment via ConfigService. The sync register()
     * runs before dependency injection is ready, so the secret would have to be hardcoded.
     * registerAsync defers configuration until DI is bootstrapped.
     */
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: IConfigService<EnvironmentVariables, true>) => ({
        secret: config.get('JWT_SECRET'),
        // Note: expiresIn is NOT set here — each signAsync call passes it explicitly
        // so access tokens (15m) and any future asymmetric tokens can differ.
      }),
      inject: [I_CONFIG_SERVICE],
    }),
    TypeOrmModule.forFeature([RefreshTokenTypeOrmEntity]),
    EmployeesModule,
    IdentityModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    LocalStrategy,
    LocalAuthGuard,
    {
      provide: I_REFRESH_TOKEN_REPOSITORY,
      useClass: RefreshTokenTypeOrmRepository,
    },
  ],
  exports: [],
})
export class AuthModule {}
