import { Injectable } from '@nestjs/common';
import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
import { Meal } from '../domain/meal.entity';
import { IMealsRepository } from '../domain/meals.repository.interface';
import { CreateMealDto } from '../presentation/rest/dto/create-meal.dto';
import { UpdateMealDto } from '../presentation/rest/dto/update-meal.dto';

@Injectable()
export class MealsService {
  constructor(private readonly _repository: IMealsRepository) {}

  async create(dto: CreateMealDto): Promise<Meal> {
    // Add any business logic/validation here
    return this._repository.insert(dto as any);
  }

  async findAll(): Promise<Meal[]> {
    return this._repository.findAll();
  }

  async findOne(id: string): Promise<Meal | null> {
    return this._repository.findOneByCriteria({ id });
  }

  async update(id: string, dto: UpdateMealDto): Promise<Meal> {
    const existing = await this._repository.findOneByCriteria({ id });
    if (!existing) throw new EntityInstanceNotFoundException('Meal not found');
    return this._repository.update(id, { ...existing, ...dto } as any);
  }

  async delete(id: string): Promise<void> {
    return this._repository.delete(id);
  }
}
