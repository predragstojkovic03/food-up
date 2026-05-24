import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateExtraQuantityDto {
  @ApiProperty()
  @IsString()
  windowId: string;

  @ApiProperty()
  @IsString()
  menuItemId: string;

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  guestName?: string;
}
