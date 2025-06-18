import { Supplier } from '../../domain/supplier.entity';
import { ISuppliersRepository } from '../../domain/suppliers.repository.interface';

export interface UpdateSupplierDto {
  name?: string;
  type?: 'registered' | 'external';
  contactInfo?: string;
  businessId?: string | null;
  userId?: string | null;
}

export class UpdateSupplierUseCase {
  constructor(private readonly repository: ISuppliersRepository) {}

  async execute(id: string, dto: UpdateSupplierDto): Promise<Supplier> {
    const existing = await this.repository.findOneByCriteria({ id });
    if (!existing) throw new Error('Supplier not found');
    const updated = new Supplier(
      id,
      dto.name ?? existing.name,
      dto.type ?? existing.type,
      dto.contactInfo ?? existing.contactInfo,
      dto.businessId ?? existing.businessId,
      dto.userId ?? existing.userId,
    );
    return this.repository.update(id, updated);
  }
}
