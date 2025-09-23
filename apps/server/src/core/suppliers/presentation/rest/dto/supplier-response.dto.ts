import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { SupplierType } from 'src/core/suppliers/domain/supplier-type.enum';

export class SupplierResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty({ enum: SupplierType })
  @Expose()
  type: SupplierType;

  @ApiProperty()
  @Expose()
  contactInfo: string;

  @ApiProperty({ type: [String] })
  @Expose()
  businessIds: string[];
}
