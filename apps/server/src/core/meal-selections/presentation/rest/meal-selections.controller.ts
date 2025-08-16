import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateMealSelectionUseCase } from '../../application/use-cases/create-meal-selection.use-case';
import { DeleteMealSelectionUseCase } from '../../application/use-cases/delete-meal-selection.use-case';
import { FindAllMealSelectionsUseCase } from '../../application/use-cases/find-all-meal-selections.use-case';
import { FindMealSelectionUseCase } from '../../application/use-cases/find-meal-selection.use-case';
import { UpdateMealSelectionUseCase } from '../../application/use-cases/update-meal-selection.use-case';
import { CreateMealSelectionDto } from './dto/create-meal-selection.dto';
import { MealSelectionResponseDto } from './dto/meal-selection-response.dto';
import { UpdateMealSelectionDto } from './dto/update-meal-selection.dto';

@ApiTags('MealSelections')
@Controller('meal-selections')
export class MealSelectionsController {
  constructor(
    private readonly createUseCase: CreateMealSelectionUseCase,
    private readonly findAllUseCase: FindAllMealSelectionsUseCase,
    private readonly findOneUseCase: FindMealSelectionUseCase,
    private readonly updateUseCase: UpdateMealSelectionUseCase,
    private readonly deleteUseCase: DeleteMealSelectionUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new meal selection' })
  @ApiResponse({
    status: 201,
    description: 'Meal selection created',
    type: MealSelectionResponseDto,
  })
  async create(
    @Body() dto: CreateMealSelectionDto,
  ): Promise<MealSelectionResponseDto> {
    return this.createUseCase.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all meal selections' })
  @ApiResponse({
    status: 200,
    description: 'List of meal selections',
    type: [MealSelectionResponseDto],
  })
  async findAll(): Promise<MealSelectionResponseDto[]> {
    return this.findAllUseCase.execute();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a meal selection by ID' })
  @ApiResponse({
    status: 200,
    description: 'Meal selection found',
    type: MealSelectionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Meal selection not found' })
  async findOne(@Param('id') id: string): Promise<MealSelectionResponseDto> {
    return this.findOneUseCase.execute(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a meal selection' })
  @ApiResponse({
    status: 200,
    description: 'Meal selection updated',
    type: MealSelectionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Meal selection not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMealSelectionDto,
  ): Promise<MealSelectionResponseDto> {
    return this.updateUseCase.execute(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a meal selection' })
  @ApiResponse({ status: 200, description: 'Meal selection deleted' })
  @ApiResponse({ status: 404, description: 'Meal selection not found' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.deleteUseCase.execute(id);
  }
}
