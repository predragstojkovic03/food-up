import { IUpdateBusinessLanguage, Language } from '@food-up/shared';

export interface IBusinessOption {
  id: string;
  name: string;
}

export interface IMyBusiness {
  id: string;
  name: string;
  contactEmail: string;
  language: Language;
}

export interface IBusinessService {
  findAll(): Promise<IBusinessOption[]>;
  getMy(): Promise<IMyBusiness>;
  updateLanguage(data: IUpdateBusinessLanguage): Promise<void>;
}
