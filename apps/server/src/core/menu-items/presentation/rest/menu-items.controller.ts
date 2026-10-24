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
  @ApiResponse({ status: 404, description: 'Not found, or the supplier is not available to the caller' })
  @ApiBearerAuth()
  async create(
    @Body() dto: CreateMenuItemDto,
    @CurrentIdentity() { sub }: JwtPayload,
  ): Promise<MenuItemResponseDto> {
    const item = await this._menuItemsService.create(dto, sub);
    return this.domainToDto(item);
  }

  @Get('menu-period/:menuPeriodId')
  @ApiOperation({ summary: 'Get all menu items for a menu period' })
  @ApiResponse({ status: 200, type: [MenuItemResponseDto] })
  @ApiResponse({ status: 404, description: 'Not found, or the supplier is not available to the caller' })
  @ApiBearerAuth()
  async findByMenuPeriod(
    @Param('menuPeriodId') menuPeriodId: string,
    @CurrentIdentity() { sub }: JwtPayload,
  ): Promise<MenuItemResponseDto[]> {
    const items = await this._menuItemsService.findByMenuPeriod(menuPeriodId, sub);
    return items.map((item) => this.domainToDto(item));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a menu item by ID' })
  @ApiResponse({ status: 200, type: MenuItemResponseDto })
  @ApiResponse({ status: 404, description: 'Not found, or the supplier is not available to the caller' })
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMenuItemDto,
    @CurrentIdentity() { sub }: JwtPayload,
  ): Promise<MenuItemResponseDto> {
    const item = await this._menuItemsService.update(id, dto, sub);
    return this.domainToDto(item);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a menu item by ID' })
  @ApiResponse({ status: 204, description: 'Menu item deleted' })
  @ApiResponse({ status: 404, description: 'Not found, or the supplier is not available to the caller' })
  @ApiBearerAuth()
  async delete(
    @Param('id') id: string,
    @CurrentIdentity() { sub }: JwtPayload,
  ): Promise<void> {
    return this._menuItemsService.delete(id, sub);
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
