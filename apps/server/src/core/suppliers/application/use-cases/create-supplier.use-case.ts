import { ulid } from 'ulid';
import { Supplier } from '../../domain/supplier.entity';
import { ISuppliersRepository } from '../../domain/suppliers.repository.interface';

export interface CreateSupplierDto {
  name: string;
  type: 'registered' | 'external';
  contactInfo: string;
  businessId?: string | null;
  userId?: string | null;
}

export class CreateSupplierUseCase {
  constructor(private readonly repository: ISuppliersRepository) {}

  async execute(dto: CreateSupplierDto): Promise<Supplier> {
    const supplier = new Supplier(
      ulid(),
      dto.name,
      dto.type,
      dto.contactInfo,
      dto.businessId ?? null,
      dto.userId ?? null,
    );
    return this.repository.insert(supplier);
  }
}
