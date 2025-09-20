import { Expose } from 'class-transformer';
import { IsEnum, IsString, ValidateIf } from 'class-validator';
import { IdentityType } from 'src/core/identity/domain/identity.entity';
import { EmployeeRole } from 'src/shared/domain/role.enum';

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
