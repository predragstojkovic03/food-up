import { ApiProperty } from '@nestjs/swagger';
import { SupplierType } from 'src/core/suppliers/domain/supplier-type.enum';

export class SupplierResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: SupplierType })
  type: SupplierType;

  @ApiProperty()
  contactInfo: string;

  @ApiProperty({ type: [String] })
  businessIds: string[];
}
