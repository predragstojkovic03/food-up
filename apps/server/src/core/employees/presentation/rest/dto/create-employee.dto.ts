import { IsEmail, IsEnum, IsString } from 'class-validator';
import { Role } from 'src/shared/domain/role.enum';

export class CreateEmployeeRequestDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  businessId: string;

  @IsEnum(Role)
  role: Role;

  @IsString()
  password: string;
}
