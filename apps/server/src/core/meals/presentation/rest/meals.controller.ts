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
import { plainToClass } from 'class-transformer';
import { CurrentIdentity } from 'src/core/auth/infrastructure/current-identity.decorator';
import { JwtPayload } from 'src/core/auth/infrastructure/jwt-payload';
import { MealsService } from '../../application/meals.service';
import { Meal } from '../../domain/meal.entity';
import { CreateMealDto } from './dto/create-meal.dto';
import { MealResponseDto } from './dto/meal-response.dto';
import { UpdateMealDto } from './dto/update-meal.dto';

@ApiTags('Meals')
@Controller('meals')
export class MealsController {
  constructor(private readonly _mealsService: MealsService) {}

  @ApiOperation({ summary: 'Create a new meal' })
  @ApiResponse({ status: 201, type: MealResponseDto })
  @ApiBearerAuth()
  // ...removed global guard...
  @Post()
  async create(
    @Body() dto: CreateMealDto,
    @CurrentIdentity() { sub }: JwtPayload,
  ): Promise<MealResponseDto> {
    const meal = await this._mealsService.create(sub, dto);
    return this.toResponseDto(meal);
  }

  @Get()
  @ApiOperation({ summary: 'Get all meals' })
  @ApiResponse({ status: 200, type: [MealResponseDto] })
  @ApiBearerAuth()
  async findAll(): Promise<MealResponseDto[]> {
    const meals = await this._mealsService.findAll();
    return meals.map(this.toResponseDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a meal by ID' })
  @ApiResponse({ status: 200, type: MealResponseDto })
  @ApiResponse({ status: 404, description: 'Meal not found' })
  @ApiBearerAuth()
  async findOne(@Param('id') id: string): Promise<MealResponseDto> {
    const meal = await this._mealsService.findOne(id);
    return this.toResponseDto(meal);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a meal by ID' })
  @ApiResponse({ status: 200, type: MealResponseDto })
  @ApiResponse({ status: 404, description: 'Meal not found' })
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMealDto,
  ): Promise<MealResponseDto> {
    const meal = await this._mealsService.update(id, dto);
    return this.toResponseDto(meal);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a meal by ID' })
  @ApiResponse({ status: 204, description: 'Meal deleted' })
  @ApiResponse({ status: 404, description: 'Meal not found' })
  @ApiBearerAuth()
  async delete(@Param('id') id: string): Promise<void> {
    await this._mealsService.delete(id);
  }

  private toResponseDto(entity: Meal): MealResponseDto {
    const dto: MealResponseDto = {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      type: entity.type,
    };

    return plainToClass(MealResponseDto, dto);
  }
}
