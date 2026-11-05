import { Expose } from 'class-transformer';
import { IsEnum, IsString, ValidateIf } from 'class-validator';
import { EmployeeRole, IdentityType } from '@food-up/shared';

@Expose()
export class JwtPayload {
  @IsString()
  sub: string;

  @ValidateIf((o: JwtPayload) => o.type === IdentityType.Employee)
  @IsEnum(EmployeeRole)
  role?: EmployeeRole;

  @IsEnum(IdentityType)
  type: IdentityType;
}
