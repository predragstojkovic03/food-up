import { IExtraQuantity } from '@food-up/shared';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ExtraQuantityResponseDto implements IExtraQuantity {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() windowId: string;
  @ApiProperty() @Expose() menuItemId: string;
  @ApiProperty() @Expose() quantity: number;
  @ApiProperty({ nullable: true }) @Expose() guestName: string | null;
}
