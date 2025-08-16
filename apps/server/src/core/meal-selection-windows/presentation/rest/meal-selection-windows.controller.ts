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
import { CreateMealSelectionWindowDto } from './dto/create-meal-selection-window.dto';
import { MealSelectionWindowResponseDto } from './dto/meal-selection-window-response.dto';
import { UpdateMealSelectionWindowDto } from './dto/update-meal-selection-window.dto';

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
  @ApiResponse({
    status: 201,
    description: 'Meal selection window created',
    type: MealSelectionWindowResponseDto,
  })
  async create(
    @Body() dto: CreateMealSelectionWindowDto,
  ): Promise<MealSelectionWindowResponseDto> {
    return this.createMealSelectionWindow.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all meal selection windows' })
  @ApiResponse({
    status: 200,
    description: 'List of meal selection windows',
    type: [MealSelectionWindowResponseDto],
  })
  async findAll(): Promise<MealSelectionWindowResponseDto[]> {
    return this.findAllMealSelectionWindows.execute();
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
    return this.findMealSelectionWindow.execute(id);
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
    return this.updateMealSelectionWindow.execute(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a meal selection window' })
  @ApiResponse({ status: 200, description: 'Meal selection window deleted' })
  @ApiResponse({ status: 404, description: 'Meal selection window not found' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.deleteMealSelectionWindow.execute(id);
  }
}
