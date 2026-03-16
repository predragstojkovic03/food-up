import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { Public } from 'src/core/auth/infrastructure/public.decorator';
import { Employee } from '../../domain/employee.entity';
import { EmployeesService } from '../../application/employees.service';
import { CreateEmployeeRequestDto } from './dto/create-employee.dto';
import { EmployeeResponseDto } from './dto/employee-response.dto';
import { UpdateEmployeeRequestDto } from './dto/update-employee.dto';

@ApiTags('Employees')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly _employeesService: EmployeesService) {}

  @ApiOperation({ summary: 'Register a new employee via invite' })
  @ApiResponse({ status: 201, type: EmployeeResponseDto })
  @Public
  @Post('register')
  async register(
    @Body() createEmployeeDto: CreateEmployeeRequestDto,
  ): Promise<EmployeeResponseDto> {
    const employee = await this._employeesService.register(createEmployeeDto);
    return this.toDto(employee);
  }

  @Get('business/:businessId')
  @ApiBearerAuth()
  async findAllByBusiness(
    @Param('businessId') businessId: string,
  ): Promise<EmployeeResponseDto[]> {
    const employees = await this._employeesService.findAllByBusiness(businessId);
    return employees.map((e) => this.toDto(e));
  }

  @Get(':id')
  @ApiBearerAuth()
  async findOne(@Param('id') id: string): Promise<EmployeeResponseDto | null> {
    const employee = await this._employeesService.findOne(id);
    return employee ? this.toDto(employee) : null;
  }

  @Patch(':id')
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateEmployeeRequestDto,
  ): Promise<EmployeeResponseDto> {
    const employee = await this._employeesService.update(id, updateDto);
    return this.toDto(employee);
  }

  @Delete(':id')
  @ApiBearerAuth()
  async delete(@Param('id') id: string): Promise<void> {
    await this._employeesService.delete(id);
  }

  private toDto(employee: Employee): EmployeeResponseDto {
    return plainToInstance(EmployeeResponseDto, {
      id: employee.id,
      name: employee.name,
      role: employee.role,
      businessId: employee.businessId,
      identityId: employee.identityId,
    });
  }
}
