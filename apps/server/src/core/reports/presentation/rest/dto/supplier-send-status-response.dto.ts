import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class SupplierSendStatusResponseDto {
  @ApiProperty()
  @Expose()
  supplierId: string;

  @ApiProperty()
  @Expose()
  supplierName: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  email: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  lastSentAt: Date | null;

  @ApiProperty()
  @Expose()
  hasNewDataSinceLastSend: boolean;

  @ApiProperty()
  @Expose()
  canSend: boolean;
}
