import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

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

  @ApiProperty({ example: 'securePassword123', description: 'Password' })
  @IsString()
  password: string;
}
