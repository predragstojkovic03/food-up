import { Language } from '@food-up/shared';
import { t } from './i18n.helper';

describe('t()', () => {
  it('returns English text for Language.En', () => {
    expect(t((k) => k.mail.mealWindow.subject, Language.En)).toBe(
      'Your meal selection window is open',
    );
  });

  it('returns Serbian text for Language.Sr', () => {
    expect(t((k) => k.mail.mealWindow.subject, Language.Sr)).toBe(
      'Vaš prozor za izbor obroka je otvoren',
    );
  });

  it('returns English excel column for Language.En', () => {
    expect(t((k) => k.excel.columns.employeeName, Language.En)).toBe('Employee');
  });

  it('returns Serbian excel column for Language.Sr', () => {
    expect(t((k) => k.excel.columns.employeeName, Language.Sr)).toBe('Zaposleni');
  });
});
