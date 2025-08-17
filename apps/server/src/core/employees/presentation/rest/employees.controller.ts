import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { Role } from 'src/shared/domain/role.enum';
import { EmployeesService } from '../../application/employees.service';
import { CreateEmployeeRequestDto } from './dto/create-employee.dto';
import { EmployeeResponseDto } from './dto/employee-response.dto';
import { UpdateEmployeeRequestDto } from './dto/update-employee.dto';

@ApiTags('Employees')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly _employeesService: EmployeesService) {}

  @Post('')
  @ApiOperation({ summary: 'Create a new employee' })
  @ApiResponse({ status: 201, type: EmployeeResponseDto })
  async create(
    @Body() createEmployeeDto: CreateEmployeeRequestDto,
  ): Promise<EmployeeResponseDto> {
    const employee = await this._employeesService.create({
      ...createEmployeeDto,
      role: Role.Basic,
    });
    return plainToInstance(EmployeeResponseDto, employee);
  }

  @Get('business/:businessId')
  async findAllByBusiness(
    @Param('businessId') businessId: string,
  ): Promise<EmployeeResponseDto[]> {
    const employees =
      await this._employeesService.findAllByBusiness(businessId);
    return plainToInstance(EmployeeResponseDto, employees);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<EmployeeResponseDto | null> {
    const employee = await this._employeesService.findOne(id);
    return employee ? plainToInstance(EmployeeResponseDto, employee) : null;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateEmployeeRequestDto,
  ): Promise<EmployeeResponseDto> {
    const employee = await this._employeesService.update(id, updateDto);
    return plainToInstance(EmployeeResponseDto, employee);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    await this._employeesService.delete(id);
  }
}
