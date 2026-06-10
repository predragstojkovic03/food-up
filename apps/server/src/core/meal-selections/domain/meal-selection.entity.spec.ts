import { MealSelection } from './meal-selection.entity';

describe('MealSelection', () => {
  describe('create()', () => {
    it('stores price when provided', () => {
      const ms = MealSelection.create('emp-1', 'win-1', '2026-01-01', 'mi-1', 2, 12.50);
      expect(ms.price).toBe(12.50);
    });

    it('stores null price when not provided', () => {
      const ms = MealSelection.create('emp-1', 'win-1', '2026-01-01', 'mi-1', 2);
      expect(ms.price).toBeNull();
    });

    it('stores null price when no menu item', () => {
      const ms = MealSelection.create('emp-1', 'win-1', '2026-01-01');
      expect(ms.price).toBeNull();
    });
  });

  describe('reconstitute()', () => {
    it('reconstitutes with price', () => {
      const ms = MealSelection.reconstitute('id-1', 'emp-1', 'win-1', '2026-01-01', 'mi-1', 2, 9.99);
      expect(ms.price).toBe(9.99);
    });

    it('reconstitutes with null price', () => {
      const ms = MealSelection.reconstitute('id-1', 'emp-1', 'win-1', '2026-01-01', 'mi-1', 2, null);
      expect(ms.price).toBeNull();
    });
  });

  describe('update()', () => {
    it('updates price when new menu item provided', () => {
      const ms = MealSelection.reconstitute('id-1', 'emp-1', 'win-1', '2026-01-01', 'mi-1', 2, 9.99);
      ms.update('mi-2', undefined, 15.00);
      expect(ms.price).toBe(15.00);
    });

    it('clears price when selection cleared (menuItemId = null)', () => {
      const ms = MealSelection.reconstitute('id-1', 'emp-1', 'win-1', '2026-01-01', 'mi-1', 2, 9.99);
      ms.update(null, undefined, null);
      expect(ms.price).toBeNull();
    });

    it('does not change price when menuItemId is undefined', () => {
      const ms = MealSelection.reconstitute('id-1', 'emp-1', 'win-1', '2026-01-01', 'mi-1', 2, 9.99);
      ms.update(undefined, 3, undefined);
      expect(ms.price).toBe(9.99);
    });
  });
});
