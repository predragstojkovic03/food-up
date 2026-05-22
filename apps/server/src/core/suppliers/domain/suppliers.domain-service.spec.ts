import { Language, SupplierType } from '@food-up/shared';
import { BusinessSupplier } from 'src/core/business-suppliers/domain/business-supplier.entity';
import { Supplier } from './supplier.entity';
import { SuppliersDomainService } from './suppliers.domain-service';

function makeManagedSupplier(language: Language): Supplier & { type: SupplierType.Managed } {
  return Supplier.reconstitute('s1', 'Test', SupplierType.Managed, null, [], 'b1', undefined, language) as Supplier & { type: SupplierType.Managed };
}

function makeStandaloneSupplier(): Supplier & { type: SupplierType.Standalone } {
  return Supplier.reconstitute('s2', 'Test', SupplierType.Standalone, null, [], undefined, 'i1', Language.En) as Supplier & { type: SupplierType.Standalone };
}

function makeBusinessSupplier(language: Language): BusinessSupplier {
  return new BusinessSupplier('bs1', 'b1', 's2', language);
}

describe('SuppliersDomainService', () => {
  const svc = new SuppliersDomainService();

  describe('resolveEmailLanguage', () => {
    it('returns supplier.language for a managed supplier', () => {
      const supplier = makeManagedSupplier(Language.Sr);
      expect(svc.resolveEmailLanguage(supplier)).toBe(Language.Sr);
    });

    it('returns businessSupplier.language for a standalone supplier', () => {
      const supplier = makeStandaloneSupplier();
      const bs = makeBusinessSupplier(Language.Sr);
      expect(svc.resolveEmailLanguage(supplier, bs)).toBe(Language.Sr);
    });

    it('defaults to Language.En when managed supplier has default language', () => {
      const supplier = makeManagedSupplier(Language.En);
      expect(svc.resolveEmailLanguage(supplier)).toBe(Language.En);
    });
  });
});
