import { Inject, Injectable } from '@nestjs/common';
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
  ) {}

  async create(createBusinessDto: CreateBusinessDto): Promise<Business> {
    const business = Business.create(
      createBusinessDto.name,
      createBusinessDto.contactEmail,
      createBusinessDto.contactPhone,
    );

    return this._repository.insert(business);
  }

  async findAll(): Promise<Business[]> {
    return this._repository.findAll();
  }

  findOne(businessId: string): Promise<Business> {
    return this._repository.findOneByCriteriaOrThrow({ id: businessId });
  }
}
