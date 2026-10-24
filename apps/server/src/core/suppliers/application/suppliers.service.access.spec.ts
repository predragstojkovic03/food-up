import { EmployeeRole, IdentityType } from '@food-up/shared';
import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
import { SuppliersService } from './suppliers.service';

describe('SuppliersService — supplier access', () => {
  let service: SuppliersService;
  let repository: any;

  const suppliers: Record<string, object> = {
    'sup-managed-a': { id: 'sup-managed-a', managingBusinessId: 'biz-a', identityId: undefined },
    'sup-managed-b': { id: 'sup-managed-b', managingBusinessId: 'biz-b', identityId: undefined },
    'sup-partner': { id: 'sup-partner', managingBusinessId: undefined, identityId: 'identity-supplier-partner' },
    'sup-standalone': { id: 'sup-standalone', managingBusinessId: undefined, identityId: 'identity-supplier-other' },
  };
  const identities: Record<string, { type: IdentityType }> = {
    'identity-manager-a': { type: IdentityType.Employee },
    'identity-basic-a': { type: IdentityType.Employee },
    'identity-supplier-partner': { type: IdentityType.Supplier },
  };
  const employees: Record<string, object> = {
    'identity-manager-a': { id: 'emp-manager-a', businessId: 'biz-a', role: EmployeeRole.Manager },
    'identity-basic-a': { id: 'emp-basic-a', businessId: 'biz-a', role: EmployeeRole.Basic },
  };

  beforeEach(() => {
    repository = {
      findOneByCriteriaOrThrow: jest.fn(({ id }: { id: string }) => Promise.resolve(suppliers[id])),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    service = new SuppliersService(
      repository,
      { findById: jest.fn((id: string) => Promise.resolve(identities[id] ?? null)) } as any,
      { findByIdentity: jest.fn((id: string) => Promise.resolve(employees[id])) } as any,
      {} as any,
      { log: jest.fn(), warn: jest.fn() } as any,
      {
        findBySupplierAndBusiness: jest.fn((supplierId: string, businessId: string) =>
          Promise.resolve(supplierId === 'sup-partner' && businessId === 'biz-a' ? { supplierId, businessId } : null),
        ),
      } as any,
    );
  });

  describe('assertCanManage', () => {
    it('allows a manager of the managing business', async () => {
      await expect(service.assertCanManage('sup-managed-a', 'identity-manager-a')).resolves.toMatchObject({
        id: 'sup-managed-a',
      });
    });

    it('allows a standalone supplier to manage itself', async () => {
      await expect(service.assertCanManage('sup-partner', 'identity-supplier-partner')).resolves.toMatchObject({
        id: 'sup-partner',
      });
    });

    it.each([
      ['a manager of another business', 'sup-managed-b', 'identity-manager-a'],
      ['a basic employee of the managing business', 'sup-managed-a', 'identity-basic-a'],
      ['a partner business manager (view-only)', 'sup-partner', 'identity-manager-a'],
      ['another supplier', 'sup-standalone', 'identity-supplier-partner'],
    ])('rejects %s as not found', async (_, supplierId, identityId) => {
      await expect(service.assertCanManage(supplierId, identityId)).rejects.toBeInstanceOf(
        EntityInstanceNotFoundException,
      );
    });
  });

  describe('assertCanView', () => {
    it('allows managers of the managing business and of partner businesses', async () => {
      await expect(service.assertCanView('sup-managed-a', 'identity-manager-a')).resolves.toBeDefined();
      await expect(service.assertCanView('sup-partner', 'identity-manager-a')).resolves.toBeDefined();
    });

    it('rejects suppliers with no link to the caller', async () => {
      await expect(service.assertCanView('sup-managed-b', 'identity-manager-a')).rejects.toBeInstanceOf(
        EntityInstanceNotFoundException,
      );
      await expect(service.assertCanView('sup-standalone', 'identity-manager-a')).rejects.toBeInstanceOf(
        EntityInstanceNotFoundException,
      );
      await expect(service.assertCanView('sup-managed-a', 'identity-basic-a')).rejects.toBeInstanceOf(
        EntityInstanceNotFoundException,
      );
    });
  });

  describe('delete', () => {
    it("deletes only suppliers the caller can manage", async () => {
      await service.delete('sup-managed-a', 'identity-manager-a');
      expect(repository.delete).toHaveBeenCalledWith('sup-managed-a');

      await expect(service.delete('sup-managed-b', 'identity-manager-a')).rejects.toBeInstanceOf(
        EntityInstanceNotFoundException,
      );
      expect(repository.delete).toHaveBeenCalledTimes(1);
    });
  });
});
