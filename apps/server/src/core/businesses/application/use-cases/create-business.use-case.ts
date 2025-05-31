import { ulid } from 'ulid';
import { Business } from '../../domain/business.entity';
import { IBusinessesRepository } from '../../domain/businesses.repository';
import { CreateBusinessDto } from '../dto/create-business.dto';

export class CreateBusinessUseCase {
  constructor(private readonly repository: IBusinessesRepository) {}

  async execute(createBusinessDto: CreateBusinessDto): Promise<Business> {
    const business = new Business(
      ulid(),
      createBusinessDto.name,
      createBusinessDto.contactEmail,
    );

    return await this.repository.insert(business);
  }
}
