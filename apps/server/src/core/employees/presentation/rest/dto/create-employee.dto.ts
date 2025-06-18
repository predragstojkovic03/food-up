import { IsBoolean, IsString } from 'class-validator';

export class CreateEmployeeRequestDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  businessId: string;

  @IsBoolean()
  isAdmin?: boolean;
}
