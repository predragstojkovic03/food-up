import { SetMetadata } from '@nestjs/common';
import { IdentityType as IdentityTypeEnum } from '@food-up/shared';

export const IDENTITY_TYPE_KEY = 'identityType';
export const RequiredIdentityType = (...types: IdentityTypeEnum[]) =>
  SetMetadata(IDENTITY_TYPE_KEY, types);
