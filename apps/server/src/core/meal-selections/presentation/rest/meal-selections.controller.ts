import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreateMealSelectionUseCase } from '../../application/use-cases/create-meal-selection.use-case';
import { DeleteMealSelectionUseCase } from '../../application/use-cases/delete-meal-selection.use-case';
import { FindAllMealSelectionsUseCase } from '../../application/use-cases/find-all-meal-selections.use-case';
import { FindMealSelectionUseCase } from '../../application/use-cases/find-meal-selection.use-case';
import { UpdateMealSelectionUseCase } from '../../application/use-cases/update-meal-selection.use-case';
// TODO: Import DTOs when available

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
  async create(@Body() dto: any) {
    return this.createUseCase.execute(dto);
  }

  @Get()
  async findAll() {
    return this.findAllUseCase.execute();
  }

  @Get(':id')
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
