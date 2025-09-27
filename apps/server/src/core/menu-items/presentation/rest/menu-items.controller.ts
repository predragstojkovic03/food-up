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
import { MenuItemsService } from '../../application/menu-items.service';
import { MenuItem } from '../../domain/menu-item.entity';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { MenuItemResponseDto } from './dto/menu-item-response.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@ApiTags('MenuItems')
@Controller('menu-items')
export class MenuItemsController {
  constructor(private readonly _menuItemsService: MenuItemsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new menu item' })
  @ApiResponse({ status: 201, type: MenuItemResponseDto })
  @ApiBearerAuth()
  async create(@Body() dto: CreateMenuItemDto): Promise<MenuItemResponseDto> {
    const item = await this._menuItemsService.create(dto);
    return this.domainToDto(item);
  }

  @Get()
  @ApiOperation({ summary: 'Get all menu items' })
  @ApiResponse({ status: 200, type: [MenuItemResponseDto] })
  @ApiBearerAuth()
  async findAll(): Promise<MenuItemResponseDto[]> {
    const items = await this._menuItemsService.findAll();
    return items.map((item) => this.domainToDto(item));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a menu item by ID' })
  @ApiResponse({ status: 200, type: MenuItemResponseDto })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  @ApiBearerAuth()
  async findOne(@Param('id') id: string): Promise<MenuItemResponseDto> {
    const item = await this._menuItemsService.findOne(id);
    return this.domainToDto(item);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a menu item by ID' })
  @ApiResponse({ status: 200, type: MenuItemResponseDto })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMenuItemDto,
  ): Promise<MenuItemResponseDto> {
    const item = await this._menuItemsService.update(id, dto);
    return this.domainToDto(item);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a menu item by ID' })
  @ApiResponse({ status: 204, description: 'Menu item deleted' })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  @ApiBearerAuth()
  async delete(@Param('id') id: string): Promise<void> {
    return this._menuItemsService.delete(id);
  }

  private domainToDto(entity: MenuItem): MenuItemResponseDto {
    const dto: MenuItemResponseDto = {
      id: entity.id,
      price: entity.price,
      menuPeriodId: entity.menuPeriodId,
      day: entity.day,
      mealId: entity.mealId,
    };
    return plainToInstance(MenuItemResponseDto, dto);
  }
}
