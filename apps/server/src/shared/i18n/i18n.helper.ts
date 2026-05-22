import { Language } from '@food-up/shared';
import en, { type Translations } from './translations/en';
import sr from './translations/sr';

export function t(selector: (tr: Translations) => string, language: Language): string {
  const tr = language === Language.Sr ? sr : en;
  return selector(tr);
}
