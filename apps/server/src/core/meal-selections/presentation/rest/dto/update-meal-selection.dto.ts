import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateMealSelectionDto {
  @ApiPropertyOptional({ nullable: true, description: 'Set to null to record a skip' })
  @IsString()
  @IsOptional()
  menuItemId?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsNumber()
  quantity?: number | null;
}
