import { Language } from '@food-up/shared';
import en from './translations/en';
import sr from './translations/sr';

type StringValues<T> = { [K in keyof T]: T[K] extends string ? string : StringValues<T[K]> };

export type TranslationStructure = StringValues<typeof en>;

export function t(selector: (tr: TranslationStructure) => string, language: Language): string {
  const tr = language === Language.Sr ? sr : en;
  return selector(tr as unknown as TranslationStructure);
}
