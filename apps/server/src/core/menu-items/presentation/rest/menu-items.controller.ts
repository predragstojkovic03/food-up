import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateMenuItemUseCase } from '../../application/use-cases/create-menu-item.use-case';
import { FindAllMenuItemsUseCase } from '../../application/use-cases/find-all-menu-items.use-case';
import { FindMenuItemUseCase } from '../../application/use-cases/find-menu-item.use-case';
import { UpdateMenuItemUseCase } from '../../application/use-cases/update-menu-item.use-case';
import { DeleteMenuItemUseCase } from '../../application/use-cases/delete-menu-item.use-case';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { MenuItemResponseDto } from './dto/menu-item-response.dto';
import { plainToInstance } from 'class-transformer';

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
  async create(@Body() dto: CreateMenuItemDto): Promise<MenuItemResponseDto> {
    const item = await this.createMenuItem.execute(dto);
    return plainToInstance(MenuItemResponseDto, item);
  }

  @Get()
  async findAll(): Promise<MenuItemResponseDto[]> {
    const items = await this.findAllMenuItems.execute();
    return plainToInstance(MenuItemResponseDto, items);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<MenuItemResponseDto> {
    const item = await this.findMenuItem.execute(id);
    return plainToInstance(MenuItemResponseDto, item);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateMenuItemDto): Promise<MenuItemResponseDto> {
    const item = await this.updateMenuItem.execute(id, dto);
    return plainToInstance(MenuItemResponseDto, item);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.deleteMenuItem.execute(id);
  }
}
