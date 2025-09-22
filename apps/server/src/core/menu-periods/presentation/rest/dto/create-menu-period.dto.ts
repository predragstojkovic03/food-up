import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsString } from 'class-validator';

export class CreateMenuPeriodDto {
  @ApiProperty({
    example: '2025-08-01T00:00:00.000Z',
    description: 'Start date of the menu period',
    type: String,
  })
  @IsDate()
  @Transform(({ value }) => new Date(value))
  startDate: Date;

  @ApiProperty({
    example: '2025-08-31T00:00:00.000Z',
    description: 'End date of the menu period',
    type: String,
  })
  @IsDate()
  @Transform(({ value }) => new Date(value))
  endDate: Date;

  @ApiProperty({
    example: '01FZ8Z5Y6X9J8A1B2C3D4E5F6G',
    description: 'ID of the supplier for whom the menu period is created',
    type: String,
  })
  @IsString()
  supplierId: string;
}
