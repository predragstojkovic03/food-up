import { Expose } from 'class-transformer';
import { IdentityType } from 'src/core/identity/domain/identity.entity';
import { EmployeeRole } from 'src/shared/domain/role.enum';

export class MeResponseDto {
  @Expose()
  id: string;
  @Expose()
  type: IdentityType;
  @Expose()
  role?: EmployeeRole;
}
