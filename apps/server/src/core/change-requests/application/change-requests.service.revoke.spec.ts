import { ChangeRequestStatus } from '@food-up/shared';
import { ChangeRequest } from '../domain/change-request.entity';
import { ChangeRequestsService } from './change-requests.service';
import { UnauthorizedException } from 'src/shared/domain/exceptions/unauthorized.exception';

function makePendingCR(employeeId: string): ChangeRequest {
  return ChangeRequest.reconstitute(
    'cr-1',
    employeeId,
    'window-1',
    'item-1',
    1,
    ChangeRequestStatus.Pending,
    'sel-1',
  );
}

describe('ChangeRequestsService.revoke', () => {
  const identityId = 'identity-1';
  const employeeId = 'emp-1';

  let service: ChangeRequestsService;
  let mockRepository: { findOneByCriteriaOrThrow: jest.Mock; update: jest.Mock };
  let mockEmployeesService: { findByIdentity: jest.Mock };

  beforeEach(() => {
    mockRepository = {
      findOneByCriteriaOrThrow: jest.fn(),
      update: jest.fn().mockResolvedValue(undefined),
    };
    mockEmployeesService = {
      findByIdentity: jest.fn().mockResolvedValue({ id: employeeId }),
    };

    service = new ChangeRequestsService(
      mockRepository as any,
      null as any,
      null as any,
      mockEmployeesService as any,
      null as any,
      { log: jest.fn() } as any,
      null as any,
      { emit: jest.fn() } as any,
    );
  });

  it('throws UnauthorizedException when employee does not own the change request', async () => {
    mockRepository.findOneByCriteriaOrThrow.mockResolvedValue(makePendingCR('other-emp'));

    await expect(service.revoke('cr-1', identityId)).rejects.toThrow(UnauthorizedException);
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('sets status to Revoked and persists', async () => {
    const cr = makePendingCR(employeeId);
    mockRepository.findOneByCriteriaOrThrow.mockResolvedValue(cr);

    await service.revoke('cr-1', identityId);

    expect(cr.status).toBe(ChangeRequestStatus.Revoked);
    expect(mockRepository.update).toHaveBeenCalledWith('cr-1', cr);
  });
});
