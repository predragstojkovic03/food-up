import { Inject, Injectable } from '@nestjs/common';
import { IdentityService } from 'src/core/identity/application/identity.service';
import { IdentityType } from 'src/core/identity/domain/identity.entity';
import {
  I_TRANSACTION_RUNNER,
  ITransactionRunner,
} from 'src/shared/application/transaction.runner';
import { EmployeeRole } from 'src/shared/domain/role.enum';
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
    @Inject(I_TRANSACTION_RUNNER)
    private readonly _transactionRunner: ITransactionRunner,
  ) {}

  async register(dto: CreateEmployeeDto): Promise<Employee> {
    return this._transactionRunner.run(async () => {
      const identity = await this._identityService.create({
        email: dto.email,
        password: dto.password,
        type: IdentityType.Employee,
        isActive: true,
      });

      const entity = Employee.create(
        dto.name,
        dto.role ?? EmployeeRole.Basic,
        dto.businessId,
        identity.id,
      );

      return this.repo.insert(entity);
    });
  }

  async findAllByBusiness(businessId: string): Promise<Employee[]> {
    return this.repo.findByCriteria({ businessId });
  }

  async findOne(id: string): Promise<Employee> {
    return this.repo.findOneByCriteriaOrThrow({ id });
  }

  async findByIdentity(identityId: string): Promise<Employee> {
    return this.repo.findOneByCriteriaOrThrow({ identityId });
  }

  async update(id: string, dto: any): Promise<Employee> {
    const employee = await this.findOne(id);

    if (dto.name !== undefined) {
      employee.name = dto.name;
    }

    if (dto.role !== undefined) {
      employee.role = dto.role;
    }

    return this.repo.update(id, employee);
  }

  async delete(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}
