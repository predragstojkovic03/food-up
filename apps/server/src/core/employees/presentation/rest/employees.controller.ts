import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { CreateEmployeeUseCase } from '../../application/use-cases/create-employee.use-case';
import { DeleteEmployeeUseCase } from '../../application/use-cases/delete-employee.use-case';
import { FindAllEmployeesByBusinessUseCase } from '../../application/use-cases/find-all-employees.use-case';
import { FindEmployeeUseCase } from '../../application/use-cases/find-employee.use-case';
import { UpdateEmployeeUseCase } from '../../application/use-cases/update-employee.use-case';
import { CreateEmployeeRequestDto } from './dto/create-employee.dto';
import { EmployeeResponseDto } from './dto/employee-response.dto';

@ApiTags('Employees')
@Controller('employees')
export class EmployeesController {
  constructor(
    private readonly _createEmployeeUseCase: CreateEmployeeUseCase,
    private readonly _findAllEmployeesByBusiness: FindAllEmployeesByBusinessUseCase,
    private readonly _findEmployeeUseCase: FindEmployeeUseCase,
    private readonly _updateEmployeeUseCase: UpdateEmployeeUseCase,
    private readonly _deleteEmployeeUseCase: DeleteEmployeeUseCase,
  ) {}

  @Post('')
  @ApiOperation({ summary: 'Create a new employee' })
  @ApiResponse({ status: 201, type: EmployeeResponseDto })
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

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<EmployeeResponseDto | null> {
    const employee = await this._findEmployeeUseCase.execute(id);
    return employee ? plainToInstance(EmployeeResponseDto, employee) : null;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: Partial<CreateEmployeeRequestDto>,
  ): Promise<EmployeeResponseDto> {
    const employee = await this._updateEmployeeUseCase.execute(id, updateDto);
    return plainToInstance(EmployeeResponseDto, employee);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    await this._deleteEmployeeUseCase.execute(id);
  }
}
