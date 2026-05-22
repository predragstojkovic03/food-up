import { Language } from '@food-up/shared';
import en from './translations/en';
import sr from './translations/sr';

type TranslationStructure = {
  [K in keyof typeof en]: {
    [L in keyof (typeof en)[K]]: {
      [M in keyof (typeof en)[K][L]]: string;
    };
  };
};

export function t(selector: (tr: TranslationStructure) => string, language: Language): string {
  const tr = language === Language.Sr ? sr : en;
  return selector(tr as TranslationStructure);
}
