import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meal } from '../../domain/meal.entity';
import { IMealsRepository } from '../../domain/meals.repository.interface';

export class MealsTypeOrmRepository implements IMealsRepository {
  constructor(
    @InjectRepository(Meal)
    private readonly _repository: Repository<Meal>,
  ) {}

  async findAll(): Promise<Meal[]> {
    return (await this._repository.find()).map(this.toDomain);
  }

  async findById(id: string): Promise<Meal | null> {
    const entity = await this._repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async insert(meal: Meal): Promise<Meal> {
    const entity = this._repository.create(meal);
    await this._repository.save(entity);
    return this.toDomain(entity);
  }

  async update(id: string, meal: Meal): Promise<Meal> {
    await this._repository.update(id, meal);
    const updated = await this._repository.findOne({ where: { id } });
    return this.toDomain(updated!);
  }

  async delete(id: string): Promise<void> {
    await this._repository.delete(id);
  }

  async findByCriteria(criteria: Partial<Meal>): Promise<Meal[]> {
    return (await this._repository.find({ where: criteria })).map(
      this.toDomain,
    );
  }

  async findOneByCriteria(criteria: Partial<Meal>): Promise<Meal | null> {
    const entity = await this._repository.findOne({ where: criteria });
    return entity ? this.toDomain(entity) : null;
  }

  private toDomain(entity: Meal): Meal {
    return new Meal(entity.id, entity.name, entity.description, entity.type);
  }
}
