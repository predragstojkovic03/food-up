import { Inject, Injectable } from '@nestjs/common';
import { ulid } from 'ulid';
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
    private readonly businessRepository: IBusinessesRepository,
  ) {}

  async create(createBusinessDto: CreateBusinessDto): Promise<Business> {
    const business = new Business(
      ulid(),
      createBusinessDto.name,
      createBusinessDto.contactEmail,
      createBusinessDto.contactPhone,
    );

    return this.businessRepository.insert(business);
  }

  async findAll(): Promise<Business[]> {
    return this.businessRepository.findAll();
  }

  findOne(businessId: string): Promise<Business> {
    return this.businessRepository.findOneByCriteriaOrThrow({ id: businessId });
  }
}
