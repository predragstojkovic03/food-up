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
import { EmployeeRole, IdentityType } from '@food-up/shared';
import { plainToInstance } from 'class-transformer';
import { Public } from 'src/core/auth/infrastructure/public.decorator';
import { CurrentIdentity } from 'src/core/auth/infrastructure/current-identity.decorator';
import { JwtPayload } from 'src/core/auth/infrastructure/jwt-payload';
import { RequiredIdentityType } from 'src/core/identity/presentation/rest/identity-type.decorator';
import { EmployeesService } from '../../application/employees.service';
import { EmployeeView } from '../../application/dto/employee-view';
import { CreateEmployeeRequestDto } from './dto/create-employee.dto';
import { EmployeeResponseDto } from './dto/employee-response.dto';
import { UpdateEmployeeRequestDto } from './dto/update-employee.dto';
import { UpdateEmployeeSelfRequestDto } from './dto/update-employee-self.dto';
import { RequiredEmployeeRole } from './employee-role.decorator';

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

  @Patch('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current employee name' })
  @ApiResponse({ status: 200, type: EmployeeResponseDto })
  async updateMe(
    @CurrentIdentity() user: JwtPayload,
    @Body() dto: UpdateEmployeeSelfRequestDto,
  ): Promise<EmployeeResponseDto> {
    const view = await this._employeesService.updateSelf(user.sub, dto.name);
    return this.viewToDto(view);
  }

  @Get('business/:businessId')
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get all employees of the current manager's business" })
  @ApiResponse({ status: 200, type: [EmployeeResponseDto] })
  @ApiResponse({ status: 404, description: 'Business is not the manager\'s own business' })
  @RequiredIdentityType(IdentityType.Employee)
  @RequiredEmployeeRole(EmployeeRole.Manager)
  async findAllByBusiness(
    @Param('businessId') businessId: string,
    @CurrentIdentity() { sub }: JwtPayload,
  ): Promise<EmployeeResponseDto[]> {
    const views = await this._employeesService.findAllInManagerBusiness(businessId, sub);
    return views.map((v) => this.viewToDto(v));
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update an employee of the current manager's business" })
  @ApiResponse({ status: 200, type: EmployeeResponseDto })
  @ApiResponse({ status: 404, description: 'Employee not found in the manager\'s business' })
  @RequiredIdentityType(IdentityType.Employee)
  @RequiredEmployeeRole(EmployeeRole.Manager)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateEmployeeRequestDto,
    @CurrentIdentity() { sub }: JwtPayload,
  ): Promise<EmployeeResponseDto> {
    const view = await this._employeesService.updateInManagerBusiness(id, updateDto, sub);
    return this.viewToDto(view);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete an employee of the current manager's business" })
  @ApiResponse({ status: 200, description: 'Employee deleted' })
  @ApiResponse({ status: 404, description: 'Employee not found in the manager\'s business' })
  @RequiredIdentityType(IdentityType.Employee)
  @RequiredEmployeeRole(EmployeeRole.Manager)
  async delete(
    @Param('id') id: string,
    @CurrentIdentity() { sub }: JwtPayload,
  ): Promise<void> {
    await this._employeesService.deleteInManagerBusiness(id, sub);
  }

  private viewToDto(view: EmployeeView): EmployeeResponseDto {
    return plainToInstance(EmployeeResponseDto, view, {
      excludeExtraneousValues: true,
    });
  }
}
