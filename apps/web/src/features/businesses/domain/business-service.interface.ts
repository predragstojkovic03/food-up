import { IUpdateBusinessLanguage } from '@food-up/shared';

export interface IBusinessOption {
  id: string;
  name: string;
}

export interface IBusinessService {
  findAll(): Promise<IBusinessOption[]>;
  updateLanguage(data: IUpdateBusinessLanguage): Promise<void>;
}
