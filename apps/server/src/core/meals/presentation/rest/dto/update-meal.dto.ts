import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateMealDto } from './create-meal.dto';

/** A meal can't be moved to another supplier, so supplierId isn't updatable. */
export class UpdateMealDto extends PartialType(
  OmitType(CreateMealDto, ['supplierId'] as const),
) {}
