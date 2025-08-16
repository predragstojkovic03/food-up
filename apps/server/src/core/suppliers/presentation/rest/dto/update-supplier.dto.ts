import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { SupplierType } from 'src/core/suppliers/domain/supplier-type.enum';

export class UpdateSupplierDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ enum: SupplierType })
  @IsEnum(SupplierType)
  @IsOptional()
  type?: SupplierType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  contactInfo?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  businessIds?: string[];
}
