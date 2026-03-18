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
import { CurrentIdentity } from 'src/core/auth/infrastructure/current-identity.decorator';
import { JwtPayload } from 'src/core/auth/infrastructure/jwt-payload';
import { EmployeesService } from '../../application/employees.service';
import { EmployeeView } from '../../application/dto/employee-view';
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
    const identity = await this._employeesService.findByIdentityEnriched(employee.identityId);
    return this.viewToDto(identity);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current employee profile' })
  @ApiResponse({ status: 200, type: EmployeeResponseDto })
  async getMe(@CurrentIdentity() user: JwtPayload): Promise<EmployeeResponseDto> {
    const view = await this._employeesService.findByIdentityEnriched(user.sub);
    return this.viewToDto(view);
  }

  @Get('business/:businessId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all employees for a business' })
  @ApiResponse({ status: 200, type: [EmployeeResponseDto] })
  async findAllByBusiness(
    @Param('businessId') businessId: string,
  ): Promise<EmployeeResponseDto[]> {
    const views = await this._employeesService.findAllByBusinessEnriched(businessId);
    return views.map((v) => this.viewToDto(v));
  }

  @Get(':id')
  @ApiBearerAuth()
  async findOne(@Param('id') id: string): Promise<EmployeeResponseDto> {
    const employee = await this._employeesService.findOne(id);
    const view = await this._employeesService.findByIdentityEnriched(employee.identityId);
    return this.viewToDto(view);
  }

  @Patch(':id')
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateEmployeeRequestDto,
  ): Promise<EmployeeResponseDto> {
    const view = await this._employeesService.update(id, updateDto);
    return this.viewToDto(view);
  }

  @Delete(':id')
  @ApiBearerAuth()
  async delete(@Param('id') id: string): Promise<void> {
    await this._employeesService.delete(id);
  }

  private viewToDto(view: EmployeeView): EmployeeResponseDto {
    return plainToInstance(EmployeeResponseDto, view, {
      excludeExtraneousValues: true,
    });
  }
}
