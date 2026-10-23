import { IUpdateBusinessSettings, Language } from '@food-up/shared';

export interface IBusinessOption {
  id: string;
  name: string;
}

export interface IMyBusiness {
  id: string;
  name: string;
  contactEmail: string;
  language: Language;
  reportIncludeEmployeesWithoutSelection: boolean;
}

export interface IBusinessService {
  findAll(): Promise<IBusinessOption[]>;
  getMy(): Promise<IMyBusiness>;
  updateSettings(data: IUpdateBusinessSettings): Promise<void>;
}
