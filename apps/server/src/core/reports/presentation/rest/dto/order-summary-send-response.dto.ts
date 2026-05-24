import { IOrderSummarySend } from '@food-up/shared';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class OrderSummarySendResponseDto implements IOrderSummarySend {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  supplierId: string;

  @ApiProperty()
  @Expose()
  supplierName: string;

  @ApiProperty()
  @Expose()
  subject: string;

  @ApiProperty()
  @Expose()
  htmlContent: string;

  @ApiProperty()
  @Expose()
  sentAt: string;
}
