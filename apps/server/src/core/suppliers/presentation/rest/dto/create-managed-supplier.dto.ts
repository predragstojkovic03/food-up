import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateManagedSupplierDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  contactInfo: string;
}
