import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/shared/domain/role.enum';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'John Doe', description: 'Employee name' })
  name: string;

  @ApiProperty({ example: 'john.doe@email.com', description: 'Employee email' })
  email: string;

  @ApiProperty({ enum: Role, description: 'Employee role' })
  role: Role;

  @ApiProperty({ example: 'business-uuid', description: 'Business ID' })
  businessId: string;

  @ApiProperty({ example: 'securePassword123', description: 'Password' })
  password: string;
}
