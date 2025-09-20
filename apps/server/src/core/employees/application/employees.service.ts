import { Inject, Injectable } from '@nestjs/common';
import { IdentityService } from 'src/core/identity/application/identity.service';
import { IdentityType } from 'src/core/identity/domain/identity.entity';
import { EmployeeRole } from 'src/shared/domain/role.enum';
import { ulid } from 'ulid';
import { Employee } from '../domain/employee.entity';
import {
  I_EMPLOYEES_REPOSITORY,
  IEmployeeRepository,
} from '../domain/employee.repository.interface';
import { CreateEmployeeDto } from './dto/create-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @Inject(I_EMPLOYEES_REPOSITORY)
    private readonly repo: IEmployeeRepository,
    private readonly _identityService: IdentityService,
  ) {}

  async create(dto: CreateEmployeeDto): Promise<Employee> {
    const identity = await this._identityService.create({
      email: dto.email,
      password: dto.password,
      type: IdentityType.Employee,
      isActive: true,
    });

    // Map DTO to entity
    const entity = new Employee(
      ulid(),
      dto.name,
      dto.role ?? EmployeeRole.Basic,
      dto.businessId,
      identity.id,
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
      dto.role ?? EmployeeRole.Basic,
      dto.businessId,
      dto.identityId,
    );
    return this.repo.update(id, entity);
  }

  async delete(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}
