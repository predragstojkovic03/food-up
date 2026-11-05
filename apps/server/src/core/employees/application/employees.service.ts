import { EmployeeRole, IdentityType } from '@food-up/shared';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { BusinessInvitesService } from 'src/core/business-invites/application/business-invites.service';
import { IdentityService } from 'src/core/identity/application/identity.service';
import { I_LOGGER, ILogger } from 'src/shared/application/logger.interface';
import {
  I_TRANSACTION_RUNNER,
  ITransactionRunner,
} from 'src/shared/application/transaction.runner';
import { EntityInstanceAlreadyExistsException } from 'src/shared/domain/exceptions/entity-instance-already-exists.exception';
import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
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
    @Inject(I_LOGGER) private readonly _logger: ILogger,
  ) {}

  async register(dto: CreateEmployeeDto): Promise<Employee> {
    return this._transactionRunner.run(async () => {
      const invite = await this._businessInvitesService.consume(
        dto.inviteToken,
      );

      if (invite.email.trim().toLowerCase() !== dto.email.trim().toLowerCase()) {
        throw new InvalidInputDataException('This invite was sent to a different email address.');
      }

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

      const result = await this._repository.insert(entity);
      this._logger.log(
        `Employee registered: id=${result.id} name=${dto.name} businessId=${invite.businessId}`,
        EmployeesService.name,
      );
      return result;
    });
  }

  async registerWithGoogle(
    googleId: string,
    googleEmail: string,
    displayName: string,
    pictureUrl: string | null,
    inviteToken: string,
  ): Promise<Employee> {
    const inviteEmail = await this._businessInvitesService.validate(inviteToken);
    if (!inviteEmail) {
      throw new BadRequestException('GOOGLE_INVALID_INVITE');
    }

    if (googleEmail.toLowerCase() !== inviteEmail.toLowerCase()) {
      throw new BadRequestException('GOOGLE_EMAIL_MISMATCH');
    }

    return this._transactionRunner.run(async () => {
      const invite = await this._businessInvitesService.consume(inviteToken);

      const identity = await this._identityService.createWithGoogle({
        email: inviteEmail,
        googleId,
        pictureUrl,
        type: IdentityType.Employee,
      });

      const entity = Employee.create(
        displayName,
        EmployeeRole.Basic,
        invite.businessId,
        identity.id,
      );

      const result = await this._repository.insert(entity);
      this._logger.log(
        `Employee registered via Google: id=${result.id} name=${displayName} businessId=${invite.businessId}`,
        EmployeesService.name,
      );
      return result;
    });
  }

  async createManager(dto: {
    name: string;
    email: string;
    password: string;
    businessId: string;
  }): Promise<Employee> {
    return this._transactionRunner.run(async () => {
      if (await this._identityService.findByEmail(dto.email)) {
        throw new EntityInstanceAlreadyExistsException(`An account with email ${dto.email} already exists`);
      }

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

      const result = await this._repository.insert(entity);
      this._logger.log(
        `Manager created: id=${result.id} name=${dto.name} businessId=${dto.businessId}`,
        EmployeesService.name,
      );
      return result;
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

  /** Lists employees of the requesting manager's business; other businesses respond as not found. */
  async findAllInManagerBusiness(
    businessId: string,
    managerIdentityId: string,
  ): Promise<EmployeeView[]> {
    const manager = await this.findByIdentity(managerIdentityId);
    if (manager.businessId !== businessId) {
      throw new EntityInstanceNotFoundException(`Business ${businessId} not found`);
    }
    return this.findAllByBusinessEnriched(businessId);
  }

  async updateInManagerBusiness(
    id: string,
    dto: UpdateEmployeeDto,
    managerIdentityId: string,
  ): Promise<EmployeeView> {
    await this._findInManagerBusiness(id, managerIdentityId);
    return this._update(id, dto);
  }

  async deleteInManagerBusiness(id: string, managerIdentityId: string): Promise<void> {
    await this._findInManagerBusiness(id, managerIdentityId);
    await this._repository.delete(id);
    this._logger.log(`Employee deleted: id=${id}`, EmployeesService.name);
  }

  /** Loads an employee of the manager's business; employees of other businesses respond as not found. */
  private async _findInManagerBusiness(id: string, managerIdentityId: string): Promise<Employee> {
    const [manager, employee] = await Promise.all([
      this.findByIdentity(managerIdentityId),
      this.findOne(id),
    ]);
    if (employee.businessId !== manager.businessId) {
      this._logger.warn(
        `Cross-business employee access denied: employeeId=${id} identityId=${managerIdentityId}`,
        EmployeesService.name,
      );
      throw new EntityInstanceNotFoundException(`Employee ${id} not found`);
    }
    return employee;
  }

  private async _update(id: string, dto: UpdateEmployeeDto): Promise<EmployeeView> {
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

    this._logger.log(`Employee updated: id=${id}`, EmployeesService.name);
    return this.findByIdentityEnriched(employee.identityId);
  }

  async updateSelf(identityId: string, name: string): Promise<EmployeeView> {
    const employee = await this.findByIdentity(identityId);
    return this._update(employee.id, { name });
  }
}
