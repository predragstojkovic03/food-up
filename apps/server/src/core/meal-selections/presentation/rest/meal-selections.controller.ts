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
import { MealSelectionsService } from '../../application/meal-selections.service';
import { CreateMealSelectionDto } from './dto/create-meal-selection.dto';
import { MealSelectionResponseDto } from './dto/meal-selection-response.dto';
import { UpdateMealSelectionDto } from './dto/update-meal-selection.dto';

@ApiTags('MealSelections')
@Controller('meal-selections')
export class MealSelectionsController {
  constructor(private readonly _mealSelectionsService: MealSelectionsService) {}

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
    const result = await this._mealSelectionsService.create(dto);
    return this.toResponseDto(result);
  }

  @Get()
  @ApiOperation({ summary: 'Get all meal selections' })
  @ApiResponse({
    status: 200,
    description: 'List of meal selections',
    type: [MealSelectionResponseDto],
  })
  async findAll(): Promise<MealSelectionResponseDto[]> {
    const result = await this._mealSelectionsService.findAll();
    return result.map(this.toResponseDto);
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
    const result = await this._mealSelectionsService.findOne(id);
    return this.toResponseDto(result);
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
    const result = await this._mealSelectionsService.update(id, dto);
    return this.toResponseDto(result);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a meal selection' })
  @ApiResponse({ status: 200, description: 'Meal selection deleted' })
  @ApiResponse({ status: 404, description: 'Meal selection not found' })
  async delete(@Param('id') id: string): Promise<void> {
    return this._mealSelectionsService.delete(id);
  }

  private toResponseDto(entity: any): MealSelectionResponseDto {
    return {
      id: entity.id,
      employeeId: entity.employeeId,
      menuItemId: entity.menuItemId,
      mealSelectionWindowId: entity.mealSelectionWindowId,
      quantity: entity.quantity,
    };
  }
}
