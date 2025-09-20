import { Inject, Injectable } from '@nestjs/common';
import { Role } from 'src/shared/domain/role.enum';
import { Employee } from '../domain/employee.entity';
import {
  I_EMPLOYEES_REPOSITORY,
  IEmployeeRepository,
} from '../domain/employee.repository.interface';

@Injectable()
export class EmployeesService {
  constructor(
    @Inject(I_EMPLOYEES_REPOSITORY)
    private readonly repo: IEmployeeRepository,
  ) {}

  async create(dto: any): Promise<Employee> {
    // Map DTO to entity
    const entity = new Employee(
      dto.id,
      dto.name,
      dto.role ?? Role.Basic,
      dto.businessId,
      dto.identityId,
    );
    return this.repo.insert(entity);
  }

  async findAllByBusiness(businessId: string): Promise<Employee[]> {
    return this.repo.findByCriteria({ businessId });
  }

  async findOne(id: string): Promise<Employee | null> {
    return this.repo.findOneByCriteria({ id });
  }

  async findByIdentity(identityId: string): Promise<Employee | null> {
    return this.repo.findOneByCriteria({ identityId });
  }

  async update(id: string, dto: any): Promise<Employee> {
    // Map DTO to entity
    const entity = new Employee(
      id,
      dto.name,
      dto.role ?? Role.Basic,
      dto.businessId,
      dto.identityId,
    );
    return this.repo.update(id, entity);
  }

  async delete(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}
