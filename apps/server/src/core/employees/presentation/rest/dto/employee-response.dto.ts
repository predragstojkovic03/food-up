import { EmployeeRole } from '@food-up/shared';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class EmployeeResponseDto {
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
}
