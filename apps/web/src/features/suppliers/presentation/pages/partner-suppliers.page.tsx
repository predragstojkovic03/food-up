import { useServices } from '@/shared/infrastructure/di/service.context';
import { useQuery } from '@tanstack/react-query';

export default function PartnerSuppliersPage() {
  const { supplierService } = useServices();

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['suppliers', 'partners'],
    queryFn: () => supplierService.getPartnersByBusiness(),
  });

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold mb-1'>Partner Suppliers</h1>
        <p className='text-muted-foreground text-sm'>
          Independent suppliers your business is partnered with
        </p>
      </div>

      <div className='border rounded-lg overflow-hidden'>
        <div className='grid grid-cols-[1fr_1fr] text-xs font-medium text-muted-foreground bg-muted/40 px-4 py-2.5 border-b'>
          <span>Name</span>
          <span>Contact info</span>
        </div>

        {isLoading && (
          <div className='px-4 py-8 text-center text-muted-foreground text-sm'>
            Loading suppliers…
          </div>
        )}

        {!isLoading && suppliers.length === 0 && (
          <div className='px-4 py-8 text-center text-muted-foreground text-sm'>
            No partner suppliers yet.
          </div>
        )}

        {suppliers.map((supplier) => (
          <div
            key={supplier.id}
            className='grid grid-cols-[1fr_1fr] items-center px-4 py-3 border-b last:border-b-0 gap-4'
          >
            <span className='text-sm font-medium'>{supplier.name}</span>
            <span className='text-sm text-muted-foreground'>{supplier.contactInfo}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
