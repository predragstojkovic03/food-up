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

describe('ChangeRequest price snapshot', () => {
  describe('create()', () => {
    it('initialises price as null', () => {
      const cr = ChangeRequest.create('emp-1', 'win-1', 'mi-1', 1, 'sel-1');
      expect(cr.price).toBeNull();
    });
  });

  describe('reconstitute()', () => {
    it('restores a non-null price', () => {
      const cr = ChangeRequest.reconstitute(
        'cr-1', 'emp-1', 'win-1', 'mi-1', 1,
        ChangeRequestStatus.Approved, 'sel-1', false, 'mgr-1', new Date(), 12.50,
      );
      expect(cr.price).toBe(12.50);
    });

    it('restores a null price', () => {
      const cr = ChangeRequest.reconstitute(
        'cr-1', 'emp-1', 'win-1', 'mi-1', 1,
        ChangeRequestStatus.Approved, 'sel-1', false, 'mgr-1', new Date(), null,
      );
      expect(cr.price).toBeNull();
    });

    it('defaults price to null when argument is omitted', () => {
      const cr = ChangeRequest.reconstitute(
        'cr-1', 'emp-1', 'win-1', 'mi-1', 1,
        ChangeRequestStatus.Pending, 'sel-1',
      );
      expect(cr.price).toBeNull();
    });
  });

  describe('changeStatus()', () => {
    it('stores price when approved with a non-null price', () => {
      const cr = makePendingCR();
      cr.changeStatus(ChangeRequestStatus.Approved, 'mgr-1', new Date(), 9.99);
      expect(cr.price).toBe(9.99);
    });

    it('stores null price when approved with explicit null (clearSelection CR)', () => {
      const cr = makePendingCR();
      cr.changeStatus(ChangeRequestStatus.Approved, 'mgr-1', new Date(), null);
      expect(cr.price).toBeNull();
    });

    it('stores null price when rejected (no price argument)', () => {
      const cr = makePendingCR();
      cr.changeStatus(ChangeRequestStatus.Rejected, 'mgr-1', new Date());
      expect(cr.price).toBeNull();
    });

    it('stores null price when revoked (no price argument)', () => {
      const cr = makePendingCR();
      cr.changeStatus(ChangeRequestStatus.Revoked, 'emp-1', new Date());
      expect(cr.price).toBeNull();
    });
  });
});
