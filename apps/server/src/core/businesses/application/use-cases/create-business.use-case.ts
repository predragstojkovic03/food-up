import { EntityInstanceAlreadyExistsException } from 'src/shared/domain/exceptions/entity-instance-already-exists.exception';
import { ulid } from 'ulid';
import { Business } from '../../domain/business.entity';
import { IBusinessesRepository } from '../../domain/businesses.repository.interface';
import { CreateBusinessDto } from '../dto/create-business.dto';

export class CreateBusinessUseCase {
  constructor(private readonly repository: IBusinessesRepository) {}

  async execute(createBusinessDto: CreateBusinessDto): Promise<Business> {
    const existingBusiness = await this.repository.findOneByCriteria({
      name: createBusinessDto.name,
    });

    if (existingBusiness) {
      throw new EntityInstanceAlreadyExistsException(
        'Business with this name already exists',
      );
    }

    const business = new Business(
      ulid(),
      createBusinessDto.name,
      createBusinessDto.contactEmail,
    );

    return await this.repository.insert(business);
  }
}
