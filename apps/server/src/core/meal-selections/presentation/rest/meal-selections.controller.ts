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
import { IdentityType } from 'src/core/identity/domain/identity.entity';
import { RequiredIdentityType } from 'src/core/identity/presentation/rest/identity-type.decorator';
import { MealSelectionsService } from '../../application/meal-selections.service';
import { MealSelection } from '../../domain/meal-selection.entity';
import { CreateMealSelectionDto } from './dto/create-meal-selection.dto';
import { MealSelectionResponseDto } from './dto/meal-selection-response.dto';
import { UpdateMealSelectionDto } from './dto/update-meal-selection.dto';

@ApiTags('MealSelections')
@Controller('meal-selections')
export class MealSelectionsController {
  constructor(private readonly _mealSelectionsService: MealSelectionsService) {}

  @ApiOperation({ summary: 'Create a new meal selection' })
  @ApiResponse({
    status: 201,
    description: 'Meal selection created',
    type: MealSelectionResponseDto,
  })
  // ...removed global guard...
  @RequiredIdentityType(IdentityType.Employee)
  @ApiBearerAuth()
  @Post()
  async create(
    @Body() dto: CreateMealSelectionDto,
    @CurrentIdentity() { sub }: JwtPayload,
  ): Promise<MealSelectionResponseDto> {
    const result = await this._mealSelectionsService.create(sub, dto);
    return this.toResponseDto(result);
  }

  @Get()
  @ApiOperation({ summary: 'Get all meal selections' })
  @ApiResponse({
    status: 200,
    description: 'List of meal selections',
    type: [MealSelectionResponseDto],
  })
  @ApiBearerAuth()
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
  @ApiBearerAuth()
  async findOne(@Param('id') id: string): Promise<MealSelectionResponseDto> {
    const result = await this._mealSelectionsService.findOne(id);
    return this.toResponseDto(result);
  }

  @ApiOperation({ summary: 'Update a meal selection' })
  @ApiResponse({
    status: 200,
    description: 'Meal selection updated',
    type: MealSelectionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Meal selection not found' })
  // ...removed global guard...
  @RequiredIdentityType(IdentityType.Employee)
  @ApiBearerAuth()
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMealSelectionDto,
    @CurrentIdentity() { sub }: JwtPayload,
  ): Promise<MealSelectionResponseDto> {
    const result = await this._mealSelectionsService.update(id, sub, dto);
    return this.toResponseDto(result);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a meal selection' })
  @ApiResponse({ status: 200, description: 'Meal selection deleted' })
  @ApiResponse({ status: 404, description: 'Meal selection not found' })
  @ApiBearerAuth()
  async delete(@Param('id') id: string): Promise<void> {
    return this._mealSelectionsService.delete(id);
  }

  private toResponseDto(entity: MealSelection): MealSelectionResponseDto {
    return plainToInstance(MealSelectionResponseDto, entity);
  }
}
