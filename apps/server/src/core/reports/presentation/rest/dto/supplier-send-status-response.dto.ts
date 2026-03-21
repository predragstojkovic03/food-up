import { ISupplierSendStatus } from '@food-up/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class SupplierSendStatusResponseDto implements ISupplierSendStatus {
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
  lastSentAt: string | null;

  @ApiProperty()
  @Expose()
  hasNewDataSinceLastSend: boolean;

  @ApiProperty()
  @Expose()
  canSend: boolean;
}
