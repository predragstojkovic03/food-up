import { ChangeRequestStatus } from '@food-up/shared';
import { ChangeRequest } from './change-request.entity';
import { ChangeRequestApprovedEvent } from './events/change-request-approved.event';
import { ChangeRequestRejectedEvent } from './events/change-request-rejected.event';
import { ChangeRequestRevokedEvent } from './events/change-request-revoked.event';

function makePendingCR(): ChangeRequest {
  return ChangeRequest.reconstitute(
    'cr-1',
    'emp-1',
    'window-1',
    'item-1',
    1,
    ChangeRequestStatus.Pending,
    'sel-1',
  );
}

describe('ChangeRequest.changeStatus', () => {
  it('emits ChangeRequestRevokedEvent when status is Revoked', () => {
    const cr = makePendingCR();
    cr.changeStatus(ChangeRequestStatus.Revoked, 'emp-1', new Date());
    const events = cr.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(ChangeRequestRevokedEvent);
  });

  it('emits ChangeRequestRejectedEvent when status is Rejected', () => {
    const cr = makePendingCR();
    cr.changeStatus(ChangeRequestStatus.Rejected, 'manager-1', new Date());
    const events = cr.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(ChangeRequestRejectedEvent);
  });

  it('emits ChangeRequestApprovedEvent when status is Approved', () => {
    const cr = makePendingCR();
    cr.changeStatus(ChangeRequestStatus.Approved, 'manager-1', new Date());
    const events = cr.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(ChangeRequestApprovedEvent);
  });

  it('throws when attempting to change status of a non-Pending request', () => {
    const cr = ChangeRequest.reconstitute(
      'cr-1', 'emp-1', 'window-1', 'item-1', 1,
      ChangeRequestStatus.Approved, 'sel-1',
    );
    expect(() => cr.changeStatus(ChangeRequestStatus.Rejected, 'manager-1', new Date())).toThrow();
  });
});
