import { IUpdateBusinessSettings, Language } from '@food-up/shared';

export interface IMyBusiness {
  id: string;
  name: string;
  contactEmail: string;
  language: Language;
  reportIncludeEmployeesWithoutSelection: boolean;
}

export interface IBusinessService {
  getMy(): Promise<IMyBusiness>;
  updateSettings(data: IUpdateBusinessSettings): Promise<void>;
}
