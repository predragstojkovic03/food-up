import { Business } from 'src/core/businesses/infrastructure/persistence/business.typeorm-entity';
import { Identity } from 'src/core/identity/infrastructure/persistence/identity.typeorm-entity';
import { TypeOrmMapper } from 'src/shared/infrastructure/typeorm.mapper';
import { Employee } from '../../domain/employee.entity';
import { Employee as EmployeePersistence } from './employee.typeorm-entity';

export class EmployeeTypeOrmMapper extends TypeOrmMapper<
  Employee,
  EmployeePersistence
> {
  toDomain(persistence: EmployeePersistence): Employee {
    if (!persistence.business || !persistence.business.id) {
      throw new Error('Business relation is required to map Employee domain');
    }

    const employee = new Employee(
      persistence.id,
      persistence.name,
      persistence.role,
      persistence.business.id,
      persistence.identity.id,
    );

    return employee;
  }

  toPersistence(domain: Employee): EmployeePersistence {
    const employeePersistence = new EmployeePersistence();
    employeePersistence.id = domain.id;
    employeePersistence.name = domain.name;
    employeePersistence.role = domain.role;
    employeePersistence.business = { id: domain.businessId } as Business; // Assuming business is a relation and we only need the id
    employeePersistence.identity = { id: domain.identityId } as Identity; // Assuming identity is a relation and we only need the id

    return employeePersistence;
  }
}
