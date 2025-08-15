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
import { CreateMealSelectionWindowUseCase } from '../../application/use-cases/create-meal-selection-window.use-case';
import { DeleteMealSelectionWindowUseCase } from '../../application/use-cases/delete-meal-selection-window.use-case';
import { FindAllMealSelectionWindowsUseCase } from '../../application/use-cases/find-all-meal-selection-windows.use-case';
import { FindMealSelectionWindowUseCase } from '../../application/use-cases/find-meal-selection-window.use-case';
import { UpdateMealSelectionWindowUseCase } from '../../application/use-cases/update-meal-selection-window.use-case';

@ApiTags('MealSelectionWindows')
@Controller('meal-selection-windows')
export class MealSelectionWindowsController {
  constructor(
    private readonly createMealSelectionWindow: CreateMealSelectionWindowUseCase,
    private readonly findAllMealSelectionWindows: FindAllMealSelectionWindowsUseCase,
    private readonly findMealSelectionWindow: FindMealSelectionWindowUseCase,
    private readonly updateMealSelectionWindow: UpdateMealSelectionWindowUseCase,
    private readonly deleteMealSelectionWindow: DeleteMealSelectionWindowUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new meal selection window' })
  @ApiResponse({ status: 201, description: 'Meal selection window created' })
  async create(@Body() dto: any) {
    return this.createMealSelectionWindow.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all meal selection windows' })
  @ApiResponse({ status: 200, description: 'List of meal selection windows' })
  async findAll() {
    return this.findAllMealSelectionWindows.execute();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a meal selection window by ID' })
  @ApiResponse({ status: 200, description: 'Meal selection window found' })
  @ApiResponse({ status: 404, description: 'Meal selection window not found' })
  async findOne(@Param('id') id: string) {
    return this.findMealSelectionWindow.execute(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.updateMealSelectionWindow.execute(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.deleteMealSelectionWindow.execute(id);
  }
}
