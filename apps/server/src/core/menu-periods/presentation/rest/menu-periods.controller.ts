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
import { MenuPeriodsService } from '../../application/menu-periods.service';
import { CreateMenuPeriodDto } from './dto/create-menu-period.dto';
import { MenuPeriodResponseDto } from './dto/menu-period-response.dto';
import { UpdateMenuPeriodDto } from './dto/update-menu-period.dto';

@ApiTags('MenuPeriods')
@Controller('menu-periods')
export class MenuPeriodsController {
  constructor(private readonly _menuPeriodsService: MenuPeriodsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new menu period' })
  @ApiResponse({ status: 201, type: MenuPeriodResponseDto })
  async create(
    @Body() dto: CreateMenuPeriodDto,
  ): Promise<MenuPeriodResponseDto> {
    const period = await this._menuPeriodsService.create(dto);
    return plainToInstance(MenuPeriodResponseDto, period);
  }

  @Get()
  @ApiOperation({ summary: 'Get all menu periods' })
  @ApiResponse({ status: 200, type: [MenuPeriodResponseDto] })
  async findAll(): Promise<MenuPeriodResponseDto[]> {
    const periods = await this._menuPeriodsService.findAll();
    return plainToInstance(MenuPeriodResponseDto, periods);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<MenuPeriodResponseDto> {
    const period = await this._menuPeriodsService.findOne(id);
    return plainToInstance(MenuPeriodResponseDto, period);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMenuPeriodDto,
  ): Promise<MenuPeriodResponseDto> {
    const period = await this._menuPeriodsService.update(id, dto);
    return plainToInstance(MenuPeriodResponseDto, period);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this._menuPeriodsService.delete(id);
  }
}
