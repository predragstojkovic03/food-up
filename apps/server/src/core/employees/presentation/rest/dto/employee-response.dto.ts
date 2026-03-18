import { EmployeeRole, IEmployeeResponse } from '@food-up/shared';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class EmployeeResponseDto implements IEmployeeResponse {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty({ enum: EmployeeRole })
  @Expose()
  role: EmployeeRole;

  @ApiProperty()
  @Expose()
  businessId: string;

  @ApiProperty()
  @Expose()
  identityId: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  isActive: boolean;
}
