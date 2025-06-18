import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CreateEmployeeUseCase } from '../../application/use-cases/create-employee.use-case';
import { FindAllEmployeesByBusinessUseCase } from '../../application/use-cases/find-all-employees.use-case';
import { CreateEmployeeRequestDto } from './dto/create-employee.dto';
import { EmployeeResponseDto } from './dto/employee-response.dto';

@Controller('employees')
export class EmployeesController {
  constructor(
    private readonly _createEmployeeUseCase: CreateEmployeeUseCase,
    private readonly _findAllEmployeesByBusiness: FindAllEmployeesByBusinessUseCase,
  ) {}

  @Post('')
  async create(
    @Body() createEmployeeDto: CreateEmployeeRequestDto,
  ): Promise<EmployeeResponseDto> {
    const employee =
      await this._createEmployeeUseCase.execute(createEmployeeDto);

    return plainToInstance(EmployeeResponseDto, employee);
  }

  @Get('business/:businessId')
  async findAllByBusiness(
    @Param('businessId') businessId: string,
  ): Promise<EmployeeResponseDto[]> {
    const employees =
      await this._findAllEmployeesByBusiness.execute(businessId);

    return plainToInstance(EmployeeResponseDto, employees);
  }
}
