import { IEvent } from 'src/shared/domain/event.interface';

export class EmployeeCreatedEvent implements IEvent {
  name: string = 'EmployeeCreatedEvent';

  constructor(
    public readonly employeeId: string,
    public readonly employeeName: string,
    public readonly employeeRole: string,
    public readonly employeeBusinessId: string,
  ) {}
}
