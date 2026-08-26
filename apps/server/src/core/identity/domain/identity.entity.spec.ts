import { IdentityType } from '@food-up/shared';
import { Identity } from './identity.entity';

describe('Identity.createWithPassword', () => {
  it('creates identity with passwordHash set and googleId null', () => {
    const identity = Identity.createWithPassword('a@b.com', 'hash', IdentityType.Employee);
    expect(identity.passwordHash).toBe('hash');
    expect(identity.googleId).toBeNull();
  });
});

describe('Identity.createWithGoogle', () => {
  it('creates identity with googleId set and passwordHash null', () => {
    const identity = Identity.createWithGoogle('a@b.com', 'google-sub-123', IdentityType.Employee);
    expect(identity.googleId).toBe('google-sub-123');
    expect(identity.passwordHash).toBeNull();
  });
});

describe('Identity constructor invariant', () => {
  it('throws if both passwordHash and googleId are absent', () => {
    expect(() =>
      Identity.reconstitute('id', 'a@b.com', null, IdentityType.Employee, true, null),
    ).toThrow('Identity must have at least one authentication method');
  });

  it('does not throw when only passwordHash is present', () => {
    expect(() =>
      Identity.reconstitute('id', 'a@b.com', 'hash', IdentityType.Employee, true, null),
    ).not.toThrow();
  });

  it('does not throw when only googleId is present', () => {
    expect(() =>
      Identity.reconstitute('id', 'a@b.com', null, IdentityType.Employee, true, 'gid'),
    ).not.toThrow();
  });
});

describe('Identity.linkGoogle', () => {
  it('sets googleId without clearing passwordHash when clearPassword=false', () => {
    const identity = Identity.createWithPassword('a@b.com', 'hash', IdentityType.Employee);
    identity.linkGoogle('google-sub-123', false);
    expect(identity.googleId).toBe('google-sub-123');
    expect(identity.passwordHash).toBe('hash');
  });

  it('sets googleId and nulls passwordHash when clearPassword=true', () => {
    const identity = Identity.createWithPassword('a@b.com', 'hash', IdentityType.Employee);
    identity.linkGoogle('google-sub-123', true);
    expect(identity.googleId).toBe('google-sub-123');
    expect(identity.passwordHash).toBeNull();
  });
});

describe('Identity.isPasswordValid', () => {
  it('returns false immediately when passwordHash is null', async () => {
    const identity = Identity.createWithGoogle('a@b.com', 'gid', IdentityType.Employee);
    const result = await identity.isPasswordValid('any', jest.fn());
    expect(result).toBe(false);
  });
});
