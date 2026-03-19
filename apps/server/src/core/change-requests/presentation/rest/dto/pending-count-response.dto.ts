import { Expose } from 'class-transformer';

export class PendingCountResponseDto {
  @Expose() count: number;
}
