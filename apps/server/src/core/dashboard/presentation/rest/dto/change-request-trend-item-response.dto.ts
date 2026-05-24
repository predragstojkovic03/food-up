import { Expose } from 'class-transformer';

export class ChangeRequestTrendItemResponseDto {
  @Expose() windowId: string;
  @Expose() windowLabel: string;
  @Expose() windowStart: string;
  @Expose() count: number;
}
