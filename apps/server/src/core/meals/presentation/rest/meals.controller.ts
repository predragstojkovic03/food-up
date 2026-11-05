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
import { CurrentIdentity } from 'src/core/auth/presentation/rest/current-identity.decorator';
import { JwtPayload } from 'src/core/auth/application/jwt-payload';
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

  @Get('supplier/:supplierId')
  @ApiOperation({ summary: 'Get all meals for a supplier' })
  @ApiResponse({ status: 200, type: [MealResponseDto] })
  @ApiResponse({
    status: 404,
    description: 'Meal or supplier not found, or not available to the caller',
  })
  @ApiBearerAuth()
  async findBySupplier(
    @Param('supplierId') supplierId: string,
    @CurrentIdentity() { sub }: JwtPayload,
  ): Promise<MealResponseDto[]> {
    const meals = await this._mealsService.findBySupplier(supplierId, sub);
    return meals.map(this.toResponseDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a meal by ID' })
  @ApiResponse({ status: 200, type: MealResponseDto })
  @ApiResponse({
    status: 404,
    description: 'Meal or supplier not found, or not available to the caller',
  })
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMealDto,
    @CurrentIdentity() { sub }: JwtPayload,
  ): Promise<MealResponseDto> {
    const meal = await this._mealsService.update(id, dto, sub);
    return this.toResponseDto(meal);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a meal by ID' })
  @ApiResponse({ status: 204, description: 'Meal deleted' })
  @ApiResponse({
    status: 404,
    description: 'Meal or supplier not found, or not available to the caller',
  })
  @ApiBearerAuth()
  async delete(
    @Param('id') id: string,
    @CurrentIdentity() { sub }: JwtPayload,
  ): Promise<void> {
    await this._mealsService.delete(id, sub);
  }

  private toResponseDto(entity: Meal): MealResponseDto {
    const dto: MealResponseDto = {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      type: entity.type,
      price: entity.price,
      dietaryTags: entity.dietaryTags,
    };

    return plainToClass(MealResponseDto, dto);
  }
}
