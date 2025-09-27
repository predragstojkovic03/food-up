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
import { EmployeeRole } from 'src/shared/domain/role.enum';
import { EmployeesService } from '../../application/employees.service';
import { CreateEmployeeRequestDto } from './dto/create-employee.dto';
import { EmployeeResponseDto } from './dto/employee-response.dto';
import { UpdateEmployeeRequestDto } from './dto/update-employee.dto';

@ApiTags('Employees')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly _employeesService: EmployeesService) {}

  @ApiOperation({ summary: 'Create a new employee' })
  @ApiResponse({ status: 201, type: EmployeeResponseDto })
  @Public
  @Post('register')
  async register(
    @Body() createEmployeeDto: CreateEmployeeRequestDto,
  ): Promise<EmployeeResponseDto> {
    const employee = await this._employeesService.register({
      ...createEmployeeDto,
      role: EmployeeRole.Basic,
    });

    return plainToInstance(EmployeeResponseDto, employee);
  }

  @Get('business/:businessId')
  @ApiBearerAuth()
  async findAllByBusiness(
    @Param('businessId') businessId: string,
  ): Promise<EmployeeResponseDto[]> {
    const employees =
      await this._employeesService.findAllByBusiness(businessId);
    return plainToInstance(EmployeeResponseDto, employees);
  }

  @Get(':id')
  @ApiBearerAuth()
  async findOne(@Param('id') id: string): Promise<EmployeeResponseDto | null> {
    const employee = await this._employeesService.findOne(id);
    return employee ? plainToInstance(EmployeeResponseDto, employee) : null;
  }

  @Patch(':id')
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateEmployeeRequestDto,
  ): Promise<EmployeeResponseDto> {
    const employee = await this._employeesService.update(id, updateDto);
    return plainToInstance(EmployeeResponseDto, employee);
  }

  @Delete(':id')
  @ApiBearerAuth()
  async delete(@Param('id') id: string): Promise<void> {
    await this._employeesService.delete(id);
  }
}
