import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsOptional, IsString } from 'class-validator';

export class RegisterSupplierDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  contactInfo: string;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  businessIds?: string[];

  @ApiProperty({ type: String, required: true })
  @IsString()
  password: string;

  @ApiProperty({ type: String, required: true })
  @IsEmail()
  email: string;
}
