import { IUpdateEmployeeSelf } from '@food-up/shared';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdateEmployeeSelfRequestDto implements IUpdateEmployeeSelf {
  @ApiProperty({ minLength: 1 })
  @IsString()
  @MinLength(1)
  name: string;
}
