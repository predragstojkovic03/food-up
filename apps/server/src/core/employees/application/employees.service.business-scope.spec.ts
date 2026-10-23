import { EmployeeRole } from '@food-up/shared';
import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
import { EmployeesService } from './employees.service';

describe('EmployeesService — manager business scope', () => {
  let service: EmployeesService;
  let repository: any;
  let identityService: any;

  const managerIdentityId = 'identity-manager-a';
  const employees: Record<string, object> = {
    'emp-manager-a': { id: 'emp-manager-a', identityId: managerIdentityId, businessId: 'biz-a', role: EmployeeRole.Manager, name: 'Manager A' },
    'emp-a': { id: 'emp-a', identityId: 'identity-a', businessId: 'biz-a', role: EmployeeRole.Basic, name: 'Employee A' },
    'emp-b': { id: 'emp-b', identityId: 'identity-b', businessId: 'biz-b', role: EmployeeRole.Basic, name: 'Employee B' },
  };

  beforeEach(() => {
    repository = {
      findOneByCriteriaOrThrow: jest.fn((criteria: { id?: string; identityId?: string }) => {
        const found = Object.values(employees).find(
          (e: any) => e.id === criteria.id || e.identityId === criteria.identityId,
        );
        return found ? Promise.resolve({ ...found }) : Promise.reject(new EntityInstanceNotFoundException());
      }),
      findByCriteria: jest.fn(({ businessId }: { businessId: string }) =>
        Promise.resolve(Object.values(employees).filter((e: any) => e.businessId === businessId)),
      ),
      update: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    identityService = {
      findById: jest.fn().mockResolvedValue({ email: 'someone@example.com', isActive: true }),
      update: jest.fn().mockResolvedValue(undefined),
    };

    service = new EmployeesService(
      repository,
      identityService,
      {} as any,
      { run: jest.fn((fn: () => unknown) => fn()) } as any,
      { log: jest.fn(), warn: jest.fn() } as any,
    );
  });

  describe('findAllInManagerBusiness', () => {
    it("lists employees of the manager's own business", async () => {
      const views = await service.findAllInManagerBusiness('biz-a', managerIdentityId);
      expect(views.map((v) => v.id).sort()).toEqual(['emp-a', 'emp-manager-a']);
    });

    it('rejects another business as not found', async () => {
      await expect(service.findAllInManagerBusiness('biz-b', managerIdentityId)).rejects.toBeInstanceOf(
        EntityInstanceNotFoundException,
      );
      expect(repository.findByCriteria).not.toHaveBeenCalled();
    });
  });

  describe('updateInManagerBusiness', () => {
    it("updates an employee of the manager's own business", async () => {
      await service.updateInManagerBusiness('emp-a', { role: EmployeeRole.Manager, isActive: false }, managerIdentityId);
      expect(repository.update).toHaveBeenCalledWith('emp-a', expect.objectContaining({ role: EmployeeRole.Manager }));
      expect(identityService.update).toHaveBeenCalledWith('identity-a', { isActive: false });
    });

    it('rejects an employee of another business without changing anything', async () => {
      await expect(
        service.updateInManagerBusiness('emp-b', { role: EmployeeRole.Manager, isActive: false }, managerIdentityId),
      ).rejects.toBeInstanceOf(EntityInstanceNotFoundException);
      expect(repository.update).not.toHaveBeenCalled();
      expect(identityService.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteInManagerBusiness', () => {
    it("deletes an employee of the manager's own business", async () => {
      await service.deleteInManagerBusiness('emp-a', managerIdentityId);
      expect(repository.delete).toHaveBeenCalledWith('emp-a');
    });

    it('rejects an employee of another business without deleting', async () => {
      await expect(service.deleteInManagerBusiness('emp-b', managerIdentityId)).rejects.toBeInstanceOf(
        EntityInstanceNotFoundException,
      );
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });
});
