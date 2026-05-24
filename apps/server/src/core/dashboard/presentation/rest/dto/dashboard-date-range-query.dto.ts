import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GroupBy } from '../../../application/queries/dashboard-query-repository.interface';

export class DashboardDateRangeQueryDto {
  @ApiProperty({ description: 'Start date (ISO date string)', example: '2025-01-01' })
  @IsDateString()
  from: string;

  @ApiProperty({ description: 'End date (ISO date string)', example: '2025-03-31' })
  @IsDateString()
  to: string;
}

export class DashboardCostTrendQueryDto extends DashboardDateRangeQueryDto {
  @ApiPropertyOptional({ enum: ['weekly', 'monthly'], default: 'monthly' })
  @IsOptional()
  @IsString()
  @IsIn(['weekly', 'monthly'])
  groupBy?: GroupBy = 'monthly';
}
