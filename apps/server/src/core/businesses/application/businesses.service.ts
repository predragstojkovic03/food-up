import { IUpdateBusinessSettings } from '@food-up/shared';
import { Inject, Injectable } from '@nestjs/common';
import { I_LOGGER, ILogger } from 'src/shared/application/logger.interface';
import { EntityInstanceAlreadyExistsException } from 'src/shared/domain/exceptions/entity-instance-already-exists.exception';
import { Business } from '../domain/business.entity';
import {
  I_BUSINESSES_REPOSITORY,
  IBusinessesRepository,
} from '../domain/businesses.repository.interface';
import { CreateBusinessDto } from './dto/create-business.dto';

@Injectable()
export class BusinessesService {
  constructor(
    @Inject(I_BUSINESSES_REPOSITORY)
    private readonly _repository: IBusinessesRepository,
    @Inject(I_LOGGER) private readonly _logger: ILogger,
  ) {}

  async create(createBusinessDto: CreateBusinessDto): Promise<Business> {
    await this._assertNameAndContactEmailAvailable(
      createBusinessDto.name,
      createBusinessDto.contactEmail,
    );

    const business = Business.create(
      createBusinessDto.name,
      createBusinessDto.contactEmail,
      createBusinessDto.contactPhone,
    );

    const result = await this._repository.insert(business);
    this._logger.log(
      `Business created: id=${result.id} name=${result.name}`,
      BusinessesService.name,
    );
    return result;
  }

  findOne(businessId: string): Promise<Business> {
    return this._repository.findOneByCriteriaOrThrow({ id: businessId });
  }

  async updateSettings(
    businessId: string,
    settings: IUpdateBusinessSettings,
  ): Promise<Business> {
    const business = await this._repository.findOneByCriteriaOrThrow({ id: businessId });
    if (settings.language !== undefined) business.language = settings.language;
    if (settings.reportIncludeEmployeesWithoutSelection !== undefined)
      business.reportIncludeEmployeesWithoutSelection =
        settings.reportIncludeEmployeesWithoutSelection;
    await this._repository.update(business.id, business);
    this._logger.log(
      `Business settings updated: id=${businessId} language=${business.language} reportIncludeEmployeesWithoutSelection=${business.reportIncludeEmployeesWithoutSelection}`,
      BusinessesService.name,
    );
    return business;
  }

  private async _assertNameAndContactEmailAvailable(
    name: string,
    contactEmail: string,
  ): Promise<void> {
    const [byName, byContactEmail] = await Promise.all([
      this._repository.findOneByCriteria({ name }),
      this._repository.findOneByCriteria({ contactEmail }),
    ]);
    if (byName) {
      throw new EntityInstanceAlreadyExistsException(`A business named "${name}" already exists`);
    }
    if (byContactEmail) {
      throw new EntityInstanceAlreadyExistsException(
        `A business with contact email ${contactEmail} already exists`,
      );
    }
  }
}
