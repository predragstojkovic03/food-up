import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { EmployeeRole, IdentityType } from '@food-up/shared';
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

  @ApiProperty({
    description: 'The business ID (only for employee identities)',
    required: false,
  })
  @Expose()
  businessId?: string;
}
