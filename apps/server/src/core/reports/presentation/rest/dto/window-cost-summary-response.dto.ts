import { IWindowCostSummary } from '@food-up/shared';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class WindowCostSummaryResponseDto implements IWindowCostSummary {
  @ApiProperty() @Expose() supplierId: string;
  @ApiProperty() @Expose() supplierName: string;
  @ApiProperty() @Expose() totalCost: number;
}
