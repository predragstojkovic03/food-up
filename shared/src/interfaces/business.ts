import { Language } from '../enums/language.enum';

export interface IUpdateBusinessSettings {
  language?: Language;
  reportIncludeEmployeesWithoutSelection?: boolean;
}
