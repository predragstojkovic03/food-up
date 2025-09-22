import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from 'src/core/auth/infrastructure/jwt-auth.guard';
import { JwtPayload } from 'src/core/auth/infrastructure/jwt-payload';
import { EmployeeRoleGuard } from 'src/core/employees/presentation/rest/employee-role.guard';
import { IdentityType } from 'src/core/identity/domain/identity.entity';
import { RequiredIdentityType } from 'src/core/identity/presentation/rest/identity-type.decorator';
import { IdentityTypeGuard } from 'src/core/identity/presentation/rest/identity-type.guard';
import { User } from 'src/shared/infrastructure/user/user.decorator';
import { MenuPeriodsService } from '../../application/menu-periods.service';
import { CreateMenuPeriodDto } from './dto/create-menu-period.dto';
import { MenuPeriodResponseDto } from './dto/menu-period-response.dto';
import { UpdateMenuPeriodDto } from './dto/update-menu-period.dto';

@ApiTags('MenuPeriods')
@Controller('menu-periods')
export class MenuPeriodsController {
  constructor(private readonly _menuPeriodsService: MenuPeriodsService) {}

  @ApiOperation({ summary: 'Create a new menu period' })
  @ApiResponse({ status: 201, type: MenuPeriodResponseDto })
  @UseGuards(JwtAuthGuard, IdentityTypeGuard, EmployeeRoleGuard)
  @RequiredIdentityType(IdentityType.Employee, IdentityType.Supplier)
  @Post()
  async create(
    @Body() dto: CreateMenuPeriodDto,
    @User() user: JwtPayload,
  ): Promise<MenuPeriodResponseDto> {
    const period = await this._menuPeriodsService.create(user.sub, dto);
    return plainToInstance(MenuPeriodResponseDto, period);
  }

  @ApiOperation({ summary: 'Get all menu periods' })
  @ApiResponse({ status: 200, type: [MenuPeriodResponseDto] })
  @Get()
  async findAll(): Promise<MenuPeriodResponseDto[]> {
    const periods = await this._menuPeriodsService.findAll();
    return plainToInstance(MenuPeriodResponseDto, periods);
  }

  @ApiOperation({ summary: 'Get a menu period by ID' })
  @ApiResponse({ status: 200, type: MenuPeriodResponseDto })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<MenuPeriodResponseDto> {
    const period = await this._menuPeriodsService.findOne(id);
    return plainToInstance(MenuPeriodResponseDto, period);
  }

  @ApiOperation({ summary: 'Update a menu period' })
  @ApiResponse({ status: 200, type: MenuPeriodResponseDto })
  @UseGuards(JwtAuthGuard, IdentityTypeGuard, EmployeeRoleGuard)
  @RequiredIdentityType(IdentityType.Employee, IdentityType.Supplier)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMenuPeriodDto,
    @User() user: JwtPayload,
  ): Promise<MenuPeriodResponseDto> {
    const period = await this._menuPeriodsService.update(id, user.sub, dto);
    return plainToInstance(MenuPeriodResponseDto, period);
  }

  @ApiOperation({ summary: 'Delete a menu period' })
  @ApiResponse({ status: 204 })
  @UseGuards(JwtAuthGuard, IdentityTypeGuard, EmployeeRoleGuard)
  @RequiredIdentityType(IdentityType.Employee, IdentityType.Supplier)
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @User() user: JwtPayload,
  ): Promise<void> {
    return this._menuPeriodsService.delete(id, user.sub);
  }
}
