import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString } from 'class-validator';
import { Role } from 'src/shared/domain/role.enum';

export class CreateEmployeeRequestDto {
  @ApiProperty({ example: 'John Doe', description: 'Employee name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'john.doe@email.com', description: 'Employee email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'business-uuid', description: 'Business ID' })
  @IsString()
  businessId: string;

  @ApiProperty({ enum: Role, description: 'Employee role' })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ example: 'securePassword123', description: 'Password' })
  @IsString()
  password: string;
}
