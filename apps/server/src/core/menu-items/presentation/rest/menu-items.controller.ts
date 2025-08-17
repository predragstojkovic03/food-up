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
import { MenuItemsService } from '../../application/menu-items.service';
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
  async create(@Body() dto: CreateMenuItemDto): Promise<MenuItemResponseDto> {
    const item = await this._menuItemsService.create(dto);
    return plainToInstance(MenuItemResponseDto, item);
  }

  @Get()
  @ApiOperation({ summary: 'Get all menu items' })
  @ApiResponse({ status: 200, type: [MenuItemResponseDto] })
  async findAll(): Promise<MenuItemResponseDto[]> {
    const items = await this._menuItemsService.findAll();
    return plainToInstance(MenuItemResponseDto, items);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a menu item by ID' })
  @ApiResponse({ status: 200, type: MenuItemResponseDto })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  async findOne(@Param('id') id: string): Promise<MenuItemResponseDto> {
    const item = await this._menuItemsService.findOne(id);
    return plainToInstance(MenuItemResponseDto, item);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a menu item by ID' })
  @ApiResponse({ status: 200, type: MenuItemResponseDto })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMenuItemDto,
  ): Promise<MenuItemResponseDto> {
    const item = await this._menuItemsService.update(id, dto);
    return plainToInstance(MenuItemResponseDto, item);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a menu item by ID' })
  @ApiResponse({ status: 204, description: 'Menu item deleted' })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  async delete(@Param('id') id: string): Promise<void> {
    return this._menuItemsService.delete(id);
  }
}
