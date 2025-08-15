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
// TODO: Import DTOs when available

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
  @ApiResponse({ status: 201, description: 'Meal selection created' })
  async create(@Body() dto: any) {
    return this.createUseCase.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all meal selections' })
  @ApiResponse({ status: 200, description: 'List of meal selections' })
  async findAll() {
    return this.findAllUseCase.execute();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a meal selection by ID' })
  @ApiResponse({ status: 200, description: 'Meal selection found' })
  @ApiResponse({ status: 404, description: 'Meal selection not found' })
  async findOne(@Param('id') id: string) {
    return this.findOneUseCase.execute(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.updateUseCase.execute(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.deleteUseCase.execute(id);
  }
}
