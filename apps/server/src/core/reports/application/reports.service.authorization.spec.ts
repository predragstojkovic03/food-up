import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
import { InvalidInputDataException } from 'src/shared/domain/exceptions/invalid-input-data.exception';
import { ReportsService } from './reports.service';

describe('ReportsService — business ownership', () => {
  let service: ReportsService;
  let queryRepository: any;
  let sendsRepository: any;
  let mailService: any;

  const ownWindowId = 'win-own';
  const foreignWindowId = 'win-foreign';
  const managerIdentityId = 'identity-manager';
  const ownSupplierId = 'sup-own';
  const otherSupplierId = 'sup-other';

  const windows: Record<string, object> = {
    [ownWindowId]: { id: ownWindowId, businessId: 'biz-a', targetDates: ['2026-05-25'] },
    [foreignWindowId]: { id: foreignWindowId, businessId: 'biz-b', targetDates: ['2026-05-25'] },
  };

  const orderRow = {
    supplierId: ownSupplierId,
    supplierName: 'Own Supplier',
    date: '2026-05-25',
    mealType: 'lunch',
    mealName: 'Sarma',
    totalQuantity: 2,
  };

  beforeEach(() => {
    queryRepository = {
      getByWindow: jest.fn().mockResolvedValue([orderRow]),
      getByWindowAndSupplier: jest.fn().mockResolvedValue([orderRow]),
      getEmployeeSelections: jest.fn().mockResolvedValue([]),
      getEmployeesWithoutSelection: jest.fn().mockResolvedValue([]),
      getSkippedEmployees: jest.fn().mockResolvedValue([]),
      getCostByWindow: jest.fn().mockResolvedValue([]),
    };
    sendsRepository = {
      findLastByWindowAndSupplier: jest.fn().mockResolvedValue(null),
      findAllByWindow: jest.fn().mockResolvedValue([]),
      insert: jest.fn().mockResolvedValue(undefined),
    };
    mailService = { send: jest.fn().mockResolvedValue(undefined) };

    service = new ReportsService(
      queryRepository,
      sendsRepository,
      { hasApprovedCrForWindowAfter: jest.fn().mockResolvedValue(false) } as any,
      mailService,
      {
        findOne: jest.fn((id: string) =>
          Promise.resolve({
            id,
            name: 'Own Supplier',
            email: 'supplier@example.com',
            language: 'sr',
            isManaged: () => true,
          }),
        ),
      } as any,
      { findById: jest.fn().mockResolvedValue({ email: 'manager@example.com' }) } as any,
      { findByIdentity: jest.fn().mockResolvedValue({ id: 'emp-manager', businessId: 'biz-a' }) } as any,
      { findBySupplierAndBusiness: jest.fn().mockResolvedValue(null) } as any,
      { findOne: jest.fn((id: string) => Promise.resolve(windows[id])) } as any,
      {
        findOne: jest.fn().mockResolvedValue({
          id: 'biz-a',
          name: 'Business A',
          language: 'sr',
          reportIncludeEmployeesWithoutSelection: false,
        }),
      } as any,
      { get: jest.fn().mockReturnValue('http://localhost:5000') } as any,
      { log: jest.fn(), warn: jest.fn() } as any,
    );
  });

  describe('rejects windows of another business as not found', () => {
    const calls: [string, (s: ReportsService) => Promise<unknown>][] = [
      ['generateXlsx', (s) => s.generateXlsx(foreignWindowId, managerIdentityId)],
      ['getSendStatus', (s) => s.getSendStatus(foreignWindowId, managerIdentityId)],
      ['generatePreview', (s) => s.generatePreview(foreignWindowId, ownSupplierId, managerIdentityId)],
      [
        'sendToSuppliers',
        (s) =>
          s.sendToSuppliers(
            foreignWindowId,
            [{ supplierId: ownSupplierId, subject: 'S', introText: 'I' }],
            managerIdentityId,
          ),
      ],
      ['getCostSummary', (s) => s.getCostSummary(foreignWindowId, managerIdentityId)],
      ['getAllSends', (s) => s.getAllSends(foreignWindowId, managerIdentityId)],
    ];

    it.each(calls)('%s', async (_, call) => {
      await expect(call(service)).rejects.toBeInstanceOf(EntityInstanceNotFoundException);
      expect(queryRepository.getByWindow).not.toHaveBeenCalled();
      expect(queryRepository.getEmployeeSelections).not.toHaveBeenCalled();
      expect(queryRepository.getCostByWindow).not.toHaveBeenCalled();
      expect(sendsRepository.findAllByWindow).not.toHaveBeenCalled();
      expect(mailService.send).not.toHaveBeenCalled();
    });
  });

  it('generates the XLSX for a window of the manager\'s own business', async () => {
    const result = await service.generateXlsx(ownWindowId, managerIdentityId);
    expect(result.buffer.length).toBeGreaterThan(0);
  });

  it('returns the cost summary for a window of the manager\'s own business', async () => {
    await expect(service.getCostSummary(ownWindowId, managerIdentityId)).resolves.toEqual([]);
    expect(queryRepository.getCostByWindow).toHaveBeenCalledWith(ownWindowId);
  });

  it('rejects a preview for a supplier with no orders in the window', async () => {
    await expect(
      service.generatePreview(ownWindowId, otherSupplierId, managerIdentityId),
    ).rejects.toBeInstanceOf(InvalidInputDataException);
  });

  it('sends nothing if any requested supplier has no orders in the window', async () => {
    await expect(
      service.sendToSuppliers(
        ownWindowId,
        [
          { supplierId: ownSupplierId, subject: 'S', introText: 'I' },
          { supplierId: otherSupplierId, subject: 'S', introText: 'I' },
        ],
        managerIdentityId,
      ),
    ).rejects.toBeInstanceOf(InvalidInputDataException);
    expect(mailService.send).not.toHaveBeenCalled();
    expect(sendsRepository.insert).not.toHaveBeenCalled();
  });

  it('sends the order summary to a supplier with orders in the window', async () => {
    await service.sendToSuppliers(
      ownWindowId,
      [{ supplierId: ownSupplierId, subject: 'S', introText: 'I' }],
      managerIdentityId,
    );
    expect(mailService.send).toHaveBeenCalledWith(
      'supplier@example.com',
      'S',
      expect.any(String),
      expect.objectContaining({ cc: 'manager@example.com' }),
    );
    expect(sendsRepository.insert).toHaveBeenCalledTimes(1);
  });
});
