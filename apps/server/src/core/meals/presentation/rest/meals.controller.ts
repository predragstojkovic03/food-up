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
import { CreateMealUseCase } from '../../application/create-meal.use-case';
import { DeleteMealUseCase } from '../../application/delete-meal.use-case';
import { FindAllMealsUseCase } from '../../application/find-all-meals.use-case';
import { FindMealUseCase } from '../../application/find-meal.use-case';
import { UpdateMealUseCase } from '../../application/update-meal.use-case';
import { CreateMealDto } from './dto/create-meal.dto';
import { MealResponseDto } from './dto/meal-response.dto';
import { UpdateMealDto } from './dto/update-meal.dto';

@ApiTags('Meals')
@Controller('meals')
export class MealsController {
  constructor(
    private readonly createMealUseCase: CreateMealUseCase,
    private readonly findMealUseCase: FindMealUseCase,
    private readonly findAllMealsUseCase: FindAllMealsUseCase,
    private readonly updateMealUseCase: UpdateMealUseCase,
    private readonly deleteMealUseCase: DeleteMealUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new meal' })
  @ApiResponse({ status: 201, type: MealResponseDto })
  async create(@Body() dto: CreateMealDto): Promise<MealResponseDto> {
    const meal = await this.createMealUseCase.execute(dto);
    return meal as any;
  }

  @Get()
  @ApiOperation({ summary: 'Get all meals' })
  @ApiResponse({ status: 200, type: [MealResponseDto] })
  async findAll(): Promise<MealResponseDto[]> {
    const meals = await this.findAllMealsUseCase.execute();
    return meals as any;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a meal by ID' })
  @ApiResponse({ status: 200, type: MealResponseDto })
  @ApiResponse({ status: 404, description: 'Meal not found' })
  async findOne(@Param('id') id: string): Promise<MealResponseDto> {
    const meal = await this.findMealUseCase.execute(id);
    return meal as any;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a meal by ID' })
  @ApiResponse({ status: 200, type: MealResponseDto })
  @ApiResponse({ status: 404, description: 'Meal not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMealDto,
  ): Promise<MealResponseDto> {
    const meal = await this.updateMealUseCase.execute(id, dto);
    return meal as any;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a meal by ID' })
  @ApiResponse({ status: 204, description: 'Meal deleted' })
  @ApiResponse({ status: 404, description: 'Meal not found' })
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteMealUseCase.execute(id);
  }
}
