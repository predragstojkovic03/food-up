import { Identity } from './identity.entity';

export const I_IDENTITY_REPOSITORY = Symbol('IIdentityRepository');

export interface IIdentityRepository {
  findByEmail(email: string): Promise<Identity | null>;
  findById(id: string): Promise<Identity | null>;
  create(identity: Identity): Promise<Identity>;
  update(id: string, update: Partial<Identity>): Promise<Identity>;
  delete(id: string): Promise<void>;
}
