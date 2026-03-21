import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { SupplierType } from '@food-up/shared';

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

  @ApiPropertyOptional()
  @Expose()
  email: string | null;

  @ApiProperty({ type: [String] })
  @Expose()
  businessIds: string[];

  @ApiPropertyOptional()
  @Expose()
  managingBusinessId?: string;
}
