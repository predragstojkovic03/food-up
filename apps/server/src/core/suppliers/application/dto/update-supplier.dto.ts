import { Language } from '@food-up/shared';

export type UpdateSupplierDto = {
  name?: string;
  email?: string;
  language?: Language;
};
