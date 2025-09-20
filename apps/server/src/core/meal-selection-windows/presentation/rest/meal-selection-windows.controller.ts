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
import { MealSelectionWindowsService } from '../../application/meal-selection-windows.service';
import { CreateMealSelectionWindowDto } from './dto/create-meal-selection-window.dto';
import { MealSelectionWindowResponseDto } from './dto/meal-selection-window-response.dto';
import { UpdateMealSelectionWindowDto } from './dto/update-meal-selection-window.dto';

@ApiTags('MealSelectionWindows')
@Controller('meal-selection-windows')
export class MealSelectionWindowsController {
  constructor(
    private readonly _mealSelectionWindowService: MealSelectionWindowsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new meal selection window' })
  @ApiResponse({
    status: 201,
    description: 'Meal selection window created',
    type: MealSelectionWindowResponseDto,
  })
  async create(
    @Body() dto: CreateMealSelectionWindowDto,
  ): Promise<MealSelectionWindowResponseDto> {
    const result = await this._mealSelectionWindowService.create(dto);
    return this.toResponseDto(result);
  }

  @Get()
  @ApiOperation({ summary: 'Get all meal selection windows' })
  @ApiResponse({
    status: 200,
    description: 'List of meal selection windows',
    type: [MealSelectionWindowResponseDto],
  })
  async findAll(): Promise<MealSelectionWindowResponseDto[]> {
    const result = await this._mealSelectionWindowService.findAll();
    return result.map(this.toResponseDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a meal selection window by ID' })
  @ApiResponse({
    status: 200,
    description: 'Meal selection window found',
    type: MealSelectionWindowResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Meal selection window not found' })
  async findOne(
    @Param('id') id: string,
  ): Promise<MealSelectionWindowResponseDto> {
    const result = await this._mealSelectionWindowService.findOne(id);
    return this.toResponseDto(result);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a meal selection window' })
  @ApiResponse({
    status: 200,
    description: 'Meal selection window updated',
    type: MealSelectionWindowResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Meal selection window not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMealSelectionWindowDto,
  ): Promise<MealSelectionWindowResponseDto> {
    const result = await this._mealSelectionWindowService.update(id, dto);
    return this.toResponseDto(result);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a meal selection window' })
  @ApiResponse({ status: 200, description: 'Meal selection window deleted' })
  @ApiResponse({ status: 404, description: 'Meal selection window not found' })
  async delete(@Param('id') id: string): Promise<void> {
    return this._mealSelectionWindowService.delete(id);
  }

  private toResponseDto(entity: any): MealSelectionWindowResponseDto {
    return {
      id: entity.id,
      menuPeriodIds: entity.menuPeriodIds,
      startTime: entity.startTime,
      endTime: entity.endTime,
      description: entity.description ?? '',
    };
  }
}
