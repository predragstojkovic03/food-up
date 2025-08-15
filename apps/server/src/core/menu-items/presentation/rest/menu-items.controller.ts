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
import { CreateMenuItemUseCase } from '../../application/use-cases/create-menu-item.use-case';
import { DeleteMenuItemUseCase } from '../../application/use-cases/delete-menu-item.use-case';
import { FindAllMenuItemsUseCase } from '../../application/use-cases/find-all-menu-items.use-case';
import { FindMenuItemUseCase } from '../../application/use-cases/find-menu-item.use-case';
import { UpdateMenuItemUseCase } from '../../application/use-cases/update-menu-item.use-case';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { MenuItemResponseDto } from './dto/menu-item-response.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@ApiTags('MenuItems')
@Controller('menu-items')
export class MenuItemsController {
  constructor(
    private readonly createMenuItem: CreateMenuItemUseCase,
    private readonly findAllMenuItems: FindAllMenuItemsUseCase,
    private readonly findMenuItem: FindMenuItemUseCase,
    private readonly updateMenuItem: UpdateMenuItemUseCase,
    private readonly deleteMenuItem: DeleteMenuItemUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new menu item' })
  @ApiResponse({ status: 201, type: MenuItemResponseDto })
  async create(@Body() dto: CreateMenuItemDto): Promise<MenuItemResponseDto> {
    const item = await this.createMenuItem.execute(dto);
    return plainToInstance(MenuItemResponseDto, item);
  }

  @Get()
  @ApiOperation({ summary: 'Get all menu items' })
  @ApiResponse({ status: 200, type: [MenuItemResponseDto] })
  async findAll(): Promise<MenuItemResponseDto[]> {
    const items = await this.findAllMenuItems.execute();
    return plainToInstance(MenuItemResponseDto, items);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a menu item by ID' })
  @ApiResponse({ status: 200, type: MenuItemResponseDto })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  async findOne(@Param('id') id: string): Promise<MenuItemResponseDto> {
    const item = await this.findMenuItem.execute(id);
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
    const item = await this.updateMenuItem.execute(id, dto);
    return plainToInstance(MenuItemResponseDto, item);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a menu item by ID' })
  @ApiResponse({ status: 204, description: 'Menu item deleted' })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.deleteMenuItem.execute(id);
  }
}
