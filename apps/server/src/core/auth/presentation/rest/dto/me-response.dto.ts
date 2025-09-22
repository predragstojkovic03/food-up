import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IdentityType } from 'src/core/identity/domain/identity.entity';
import { EmployeeRole } from 'src/shared/domain/role.enum';
import { ulid } from 'ulid';

export class MeResponseDto {
  @ApiProperty({
    example: ulid(),
    description: 'The unique identifier of the user',
  })
  @Expose()
  id: string;

  @ApiProperty({
    example: IdentityType.Employee,
    description: 'The type of identity (e.g., Employee, Customer)',
  })
  @Expose()
  type: IdentityType;

  @ApiProperty({
    example: EmployeeRole.Manager,
    description: 'The role of the employee',
  })
  @Expose()
  role?: EmployeeRole;
}
