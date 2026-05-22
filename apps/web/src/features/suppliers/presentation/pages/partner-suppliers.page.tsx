import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useServices } from '@/shared/infrastructure/di/service.context';
import { Language } from '@food-up/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

const QUERY_KEY = ['suppliers', 'partners'];

const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: Language.En, label: 'English' },
  { value: Language.Sr, label: 'Srpski' },
];

function languageLabel(lang: Language): string {
  return LANGUAGE_OPTIONS.find((o) => o.value === lang)?.label ?? lang;
}

export default function PartnerSuppliersPage() {
  const { t } = useTranslation('suppliers');
  const { supplierService } = useServices();
  const queryClient = useQueryClient();

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => supplierService.getPartnersByBusiness(),
  });

  const updateLanguage = useMutation({
    mutationFn: ({ id, language }: { id: string; language: Language }) =>
      supplierService.update(id, { language }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold mb-1'>{t('partners.title')}</h1>
        <p className='text-muted-foreground text-sm'>
          {t('partners.subtitle')}
        </p>
      </div>

      <div className='border rounded-lg overflow-hidden'>
        <div className='grid grid-cols-[1fr_1fr_1fr] text-xs font-medium text-muted-foreground bg-muted/40 px-4 py-2.5 border-b'>
          <span>{t('partners.table.nameHeader')}</span>
          <span>{t('partners.table.emailHeader')}</span>
          <span>{t('partners.table.languageHeader')}</span>
        </div>

        {isLoading && (
          <div className='px-4 py-8 text-center text-muted-foreground text-sm'>
            {t('partners.table.loading')}
          </div>
        )}

        {!isLoading && suppliers.length === 0 && (
          <div className='px-4 py-8 text-center text-muted-foreground text-sm'>
            {t('partners.table.empty')}
          </div>
        )}

        {suppliers.map((supplier) => (
          <div
            key={supplier.id}
            className='grid grid-cols-[1fr_1fr_1fr] items-center px-4 py-3 border-b last:border-b-0 gap-4'
          >
            <span className='text-sm font-medium'>{supplier.name}</span>
            <span className='text-sm text-muted-foreground'>
              {supplier.email ?? '—'}
            </span>
            <Select
              value={supplier.language}
              onValueChange={(v) =>
                updateLanguage.mutate({ id: supplier.id, language: v as Language })
              }
              disabled={
                updateLanguage.isPending &&
                updateLanguage.variables?.id === supplier.id
              }
            >
              <SelectTrigger className='h-8 text-sm w-full max-w-36'>
                <SelectValue>
                  {(v: string) => languageLabel(v as Language)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} label={opt.label}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  );
}
