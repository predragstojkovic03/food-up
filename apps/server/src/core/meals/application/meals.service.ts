import { Inject, Injectable } from '@nestjs/common';
import { IdentityService } from 'src/core/identity/application/identity.service';
import { IdentityType } from '@food-up/shared';
import { SuppliersService } from 'src/core/suppliers/application/suppliers.service';
import { I_LOGGER, ILogger } from 'src/shared/application/logger.interface';
import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
import { InvalidInputDataException } from 'src/shared/domain/exceptions/invalid-input-data.exception';
import { Meal } from '../domain/meal.entity';
import {
  I_MEALS_REPOSITORY,
  IMealsRepository,
} from '../domain/meals.repository.interface';
import { CreateMealDto } from '../presentation/rest/dto/create-meal.dto';
import { UpdateMealDto } from '../presentation/rest/dto/update-meal.dto';

@Injectable()
export class MealsService {
  constructor(
    @Inject(I_MEALS_REPOSITORY)
    private readonly _repository: IMealsRepository,
    private readonly _identityService: IdentityService,
    private readonly _suppliersService: SuppliersService,
    @Inject(I_LOGGER) private readonly _logger: ILogger,
  ) {}

  async create(identityId: string, dto: CreateMealDto): Promise<Meal> {
    const supplierId = await this._resolveManagedSupplierId(identityId, dto.supplierId);

    const meal = Meal.create(
      dto.name,
      dto.description,
      dto.type,
      supplierId,
      dto.price,
      dto.dietaryTags ?? [],
    );

    const result = await this._repository.insert(meal);
    this._logger.log(
      `Meal created: id=${result.id} name=${dto.name} supplierId=${supplierId}`,
      MealsService.name,
    );
    return result;
  }

  async findBySupplier(supplierId: string, identityId: string): Promise<Meal[]> {
    await this._suppliersService.assertCanView(supplierId, identityId);
    return this._repository.findByCriteria({ supplierId } as any);
  }

  async findOne(id: string): Promise<Meal> {
    return this._repository.findOneByCriteriaOrThrow({ id });
  }

  async update(id: string, dto: UpdateMealDto, identityId: string): Promise<Meal> {
    const existing = await this._repository.findOneByCriteria({ id });
    if (!existing) throw new EntityInstanceNotFoundException('Meal not found');
    await this._suppliersService.assertCanManage(existing.supplierId, identityId);
    const result = await this._repository.update(id, { ...existing, ...dto } as any);
    this._logger.log(`Meal updated: id=${id}`, MealsService.name);
    return result;
  }

  async delete(id: string, identityId: string): Promise<void> {
    const existing = await this.findOne(id);
    await this._suppliersService.assertCanManage(existing.supplierId, identityId);
    await this._repository.delete(id);
    this._logger.log(`Meal deleted: id=${id}`, MealsService.name);
  }

  /**
   * The supplier a new meal is created for: the given supplier, or the caller's own supplier
   * account if none is given. The caller must be allowed to manage it.
   */
  private async _resolveManagedSupplierId(
    identityId: string,
    supplierId: string | undefined,
  ): Promise<string> {
    if (supplierId) {
      const supplier = await this._suppliersService.assertCanManage(supplierId, identityId);
      return supplier.id;
    }

    const identity = await this._identityService.findById(identityId);
    if (identity?.type !== IdentityType.Supplier) {
      throw new InvalidInputDataException(
        'Supplier ID must be provided when creating a meal as an employee.',
      );
    }
    const supplier = await this._suppliersService.findByIdentityId(identityId);
    return supplier.id;
  }
}
