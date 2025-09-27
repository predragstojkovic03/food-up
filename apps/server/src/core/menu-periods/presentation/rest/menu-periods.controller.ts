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
import { CurrentIdentity } from 'src/core/auth/infrastructure/current-identity.decorator';
import { JwtPayload } from 'src/core/auth/infrastructure/jwt-payload';
import { IdentityType } from 'src/core/identity/domain/identity.entity';
import { RequiredIdentityType } from 'src/core/identity/presentation/rest/identity-type.decorator';
import { MenuPeriodsService } from '../../application/menu-periods.service';
import { MenuPeriod } from '../../domain/menu-period.entity';
import { CreateMenuPeriodDto } from './dto/create-menu-period.dto';
import { MenuPeriodResponseDto } from './dto/menu-period-response.dto';
import { UpdateMenuPeriodDto } from './dto/update-menu-period.dto';

@ApiTags('MenuPeriods')
@Controller('menu-periods')
export class MenuPeriodsController {
  constructor(private readonly _menuPeriodsService: MenuPeriodsService) {}

  @ApiOperation({ summary: 'Create a new menu period' })
  @ApiResponse({ status: 201, type: MenuPeriodResponseDto })
  // ...removed global guard...
  @RequiredIdentityType(IdentityType.Employee, IdentityType.Supplier)
  @ApiBearerAuth()
  @Post()
  async create(
    @Body() dto: CreateMenuPeriodDto,
    @CurrentIdentity() user: JwtPayload,
  ): Promise<MenuPeriodResponseDto> {
    const period = await this._menuPeriodsService.create(user.sub, dto);
    return this.domainToDto(period);
  }

  @ApiOperation({ summary: 'Get all menu periods' })
  @ApiResponse({ status: 200, type: [MenuPeriodResponseDto] })
  @ApiBearerAuth()
  @Get()
  async findAll(): Promise<MenuPeriodResponseDto[]> {
    const periods = await this._menuPeriodsService.findAll();
    return periods.map((period) => this.domainToDto(period));
  }

  @ApiOperation({ summary: 'Get a menu period by ID' })
  @ApiResponse({ status: 200, type: MenuPeriodResponseDto })
  @ApiBearerAuth()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<MenuPeriodResponseDto> {
    const period = await this._menuPeriodsService.findOne(id);
    return this.domainToDto(period);
  }

  @ApiOperation({ summary: 'Update a menu period' })
  @ApiResponse({ status: 200, type: MenuPeriodResponseDto })
  // ...removed global guard...
  @RequiredIdentityType(IdentityType.Employee, IdentityType.Supplier)
  @ApiBearerAuth()
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMenuPeriodDto,
    @CurrentIdentity() user: JwtPayload,
  ): Promise<MenuPeriodResponseDto> {
    const period = await this._menuPeriodsService.update(id, user.sub, dto);
    return this.domainToDto(period);
  }

  @ApiOperation({ summary: 'Delete a menu period' })
  @ApiResponse({ status: 204 })
  // ...removed global guard...
  @RequiredIdentityType(IdentityType.Employee, IdentityType.Supplier)
  @ApiBearerAuth()
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @CurrentIdentity() user: JwtPayload,
  ): Promise<void> {
    return this._menuPeriodsService.delete(id, user.sub);
  }

  private domainToDto(menuPeriod: MenuPeriod): MenuPeriodResponseDto {
    const dto: MenuPeriodResponseDto = {
      id: menuPeriod.id,
      startDate: menuPeriod.startDate,
      endDate: menuPeriod.endDate,
      supplierId: menuPeriod.supplierId,
    };

    return plainToInstance(MenuPeriodResponseDto, dto);
  }
}
