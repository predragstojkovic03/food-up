import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeRequestDto } from './create-employee.dto';

export class UpdateEmployeeRequestDto extends PartialType(
  CreateEmployeeRequestDto,
) {}
