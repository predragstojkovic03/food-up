import { IBusinessSuppliersRepository } from '../../domain/business-suppliers.repository.interface';

export class DeleteBusinessSupplierUseCase {
  constructor(private readonly repository: IBusinessSuppliersRepository) {}

  async execute(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
