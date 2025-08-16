import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { SupplierType } from 'src/core/suppliers/domain/supplier-type.enum';

export class CreateSupplierDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: SupplierType })
  @IsEnum(SupplierType)
  type: SupplierType;

  @ApiProperty()
  @IsString()
  contactInfo: string;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  businessIds?: string[];

  @ApiPropertyOptional()
  @IsString()
  @ValidateIf((o) => o.type === SupplierType.External)
  managingBusinessId?: string;
}
