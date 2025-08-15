import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EmployeesModule } from '../employees/employees.module';
import { IdentityModule } from '../identity/identity.module';
import { JwtAuthGuard } from './infrastructure/jwt-auth.guard';
import { JwtStrategy } from './infrastructure/jwt.strategy';
import { AuthController } from './presentation/rest/auth.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: 'yourSecret',
      signOptions: { expiresIn: '2 days' },
    }),
    EmployeesModule,
    IdentityModule,
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, JwtAuthGuard],
  exports: [],
})
export class AuthModule {}
