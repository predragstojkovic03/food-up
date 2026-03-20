import { EmployeeRole, IdentityType } from '@food-up/shared';
import { Inject, Injectable } from '@nestjs/common';
import { BusinessInvitesService } from 'src/core/business-invites/application/business-invites.service';
import { IdentityService } from 'src/core/identity/application/identity.service';
import {
  I_TRANSACTION_RUNNER,
  ITransactionRunner,
} from 'src/shared/application/transaction.runner';
import { InvalidInputDataException } from 'src/shared/domain/exceptions/invalid-input-data.exception';
import { Employee } from '../domain/employee.entity';
import {
  I_EMPLOYEES_REPOSITORY,
  IEmployeeRepository,
} from '../domain/employee.repository.interface';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { EmployeeView } from './dto/employee-view';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @Inject(I_EMPLOYEES_REPOSITORY)
    private readonly _repository: IEmployeeRepository,
    private readonly _identityService: IdentityService,
    private readonly _businessInvitesService: BusinessInvitesService,
    @Inject(I_TRANSACTION_RUNNER)
    private readonly _transactionRunner: ITransactionRunner,
  ) {}

  async register(dto: CreateEmployeeDto): Promise<Employee> {
    return this._transactionRunner.run(async () => {
      const invite = await this._businessInvitesService.consume(
        dto.inviteToken,
      );

      const identity = await this._identityService.create({
        email: dto.email,
        password: dto.password,
        type: IdentityType.Employee,
        isActive: true,
      });

      const entity = Employee.create(
        dto.name,
        EmployeeRole.Basic,
        invite.businessId,
        identity.id,
      );

      return this._repository.insert(entity);
    });
  }

  async createManager(dto: {
    name: string;
    email: string;
    password: string;
    businessId: string;
  }): Promise<Employee> {
    return this._transactionRunner.run(async () => {
      const identity = await this._identityService.create({
        email: dto.email,
        password: dto.password,
        type: IdentityType.Employee,
        isActive: true,
      });

      const entity = Employee.create(
        dto.name,
        EmployeeRole.Manager,
        dto.businessId,
        identity.id,
      );

      return this._repository.insert(entity);
    });
  }

  async findAllByBusiness(businessId: string): Promise<Employee[]> {
    return this._repository.findByCriteria({ businessId });
  }

  async findAllByBusinessEnriched(businessId: string): Promise<EmployeeView[]> {
    const employees = await this.findAllByBusiness(businessId);
    const identities = await Promise.all(
      employees.map((emp) => this._identityService.findById(emp.identityId)),
    );
    return employees.map((emp, i) => ({
      id: emp.id,
      name: emp.name,
      role: emp.role,
      businessId: emp.businessId,
      identityId: emp.identityId,
      email: identities[i]!.email,
      isActive: identities[i]!.isActive,
    }));
  }

  async findOne(id: string): Promise<Employee> {
    return this._repository.findOneByCriteriaOrThrow({ id });
  }

  async findByIdentity(identityId: string): Promise<Employee> {
    return this._repository.findOneByCriteriaOrThrow({ identityId });
  }

  async findOneEnriched(id: string): Promise<EmployeeView> {
    const employee = await this.findOne(id);
    const identity = await this._identityService.findById(employee.identityId);

    if (!identity) {
      throw new InvalidInputDataException(
        'Requested employee has no identity.',
      );
    }

    return {
      id: employee.id,
      name: employee.name,
      role: employee.role,
      businessId: employee.businessId,
      identityId: employee.identityId,
      email: identity.email,
      isActive: identity.isActive,
    };
  }

  async findByIdentityEnriched(identityId: string): Promise<EmployeeView> {
    const identity = await this._identityService.findById(identityId);
    if (!identity) {
      throw new InvalidInputDataException('Requested identity does not exist.');
    }

    const employee = await this.findByIdentity(identityId);

    return {
      id: employee.id,
      name: employee.name,
      role: employee.role,
      businessId: employee.businessId,
      identityId: employee.identityId,
      email: identity.email,
      isActive: identity.isActive,
    };
  }

  async update(id: string, dto: UpdateEmployeeDto): Promise<EmployeeView> {
    const employee = await this.findOne(id);

    if (dto.name !== undefined) {
      employee.name = dto.name;
    }

    if (dto.role !== undefined) {
      employee.role = dto.role;
    }

    await this._repository.update(id, employee);

    if (dto.isActive !== undefined) {
      await this._identityService.update(employee.identityId, {
        isActive: dto.isActive,
      });
    }

    return this.findByIdentityEnriched(employee.identityId);
  }

  async delete(id: string): Promise<void> {
    return this._repository.delete(id);
  }
}
