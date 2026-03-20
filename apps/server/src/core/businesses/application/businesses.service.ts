import { Inject, Injectable } from '@nestjs/common';
import { I_LOGGER, ILogger } from 'src/shared/application/logger.interface';
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

  async findAll(): Promise<Business[]> {
    return this._repository.findAll();
  }

  findOne(businessId: string): Promise<Business> {
    return this._repository.findOneByCriteriaOrThrow({ id: businessId });
  }
}
