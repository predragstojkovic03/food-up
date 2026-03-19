import { ChangeRequestStatus } from '@food-up/shared';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsString,
  ValidateNested,
} from 'class-validator';

export class BulkStatusItemDto {
  @IsString()
  id: string;

  @IsEnum(ChangeRequestStatus)
  status: ChangeRequestStatus;
}

export class BulkUpdateChangeRequestStatusDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BulkStatusItemDto)
  items: BulkStatusItemDto[];
}
