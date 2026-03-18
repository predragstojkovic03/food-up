import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useServices } from '@/shared/infrastructure/di/service.context';
import { ISupplierResponse } from '@food-up/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Pencil, Plus, Settings2, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const QUERY_KEY = ['suppliers', 'in-house'];

export default function InHouseSuppliersPage() {
  const { supplierService } = useServices();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => supplierService.getManagedByBusiness(),
  });

  const createSupplier = useMutation({
    mutationFn: supplierService.createManaged.bind(supplierService),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const updateSupplier = useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      name?: string;
      contactInfo?: string;
    }) => supplierService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const removeSupplier = useMutation({
    mutationFn: (id: string) => supplierService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createContact, setCreateContact] = useState('');

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    createSupplier.mutate(
      { name: createName, contactInfo: createContact },
      {
        onSuccess: () => {
          setCreateName('');
          setCreateContact('');
          setShowCreatePanel(false);
        },
      },
    );
  }

  return (
    <div className='p-6'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold mb-1'>In-House Suppliers</h1>
          <p className='text-muted-foreground text-sm'>
            Suppliers owned and managed by your business
          </p>
        </div>
        <Button onClick={() => setShowCreatePanel(true)} className='gap-2'>
          <Plus size={16} />
          New Supplier
        </Button>
      </div>

      {showCreatePanel && (
        <div className='mb-6 border rounded-lg p-5 bg-card'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='font-semibold'>Create In-House Supplier</h2>
            <button
              onClick={() => {
                setShowCreatePanel(false);
                setCreateName('');
                setCreateContact('');
              }}
              className='text-muted-foreground hover:text-foreground transition-colors'
            >
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleCreate} className='flex gap-3 items-end'>
            <div className='flex-1'>
              <Label htmlFor='supplier-name' className='mb-1.5 block'>
                Name
              </Label>
              <Input
                id='supplier-name'
                placeholder='Supplier name'
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                required
              />
            </div>
            <div className='flex-1'>
              <Label htmlFor='supplier-contact' className='mb-1.5 block'>
                Contact info
              </Label>
              <Input
                id='supplier-contact'
                placeholder='Email or phone'
                value={createContact}
                onChange={(e) => setCreateContact(e.target.value)}
                required
              />
            </div>
            <Button type='submit' disabled={createSupplier.isPending}>
              {createSupplier.isPending ? 'Creating…' : 'Create'}
            </Button>
          </form>
          {createSupplier.isError && (
            <p className='mt-2 text-sm text-destructive'>
              Failed to create supplier. Please try again.
            </p>
          )}
        </div>
      )}

      <div className='border rounded-lg overflow-hidden'>
        <div className='grid grid-cols-[1fr_1fr_auto] text-xs font-medium text-muted-foreground bg-muted/40 px-4 py-2.5 border-b'>
          <span>Name</span>
          <span>Contact info</span>
          <span />
        </div>

        {isLoading && (
          <div className='px-4 py-8 text-center text-muted-foreground text-sm'>
            Loading suppliers…
          </div>
        )}

        {!isLoading && suppliers.length === 0 && (
          <div className='px-4 py-8 text-center text-muted-foreground text-sm'>
            No in-house suppliers yet. Create one to get started.
          </div>
        )}

        {suppliers.map((supplier) => (
          <SupplierRow
            key={supplier.id}
            supplier={supplier}
            isUpdating={
              updateSupplier.isPending &&
              updateSupplier.variables?.id === supplier.id
            }
            isRemoving={
              removeSupplier.isPending &&
              removeSupplier.variables === supplier.id
            }
            onUpdate={(data) =>
              updateSupplier.mutate({ id: supplier.id, ...data })
            }
            onRemove={() => removeSupplier.mutate(supplier.id)}
            onManage={() =>
              navigate(`/employee/manager/suppliers/in-house/${supplier.id}`)
            }
          />
        ))}
      </div>
    </div>
  );
}

interface SupplierRowProps {
  supplier: ISupplierResponse;
  isUpdating: boolean;
  isRemoving: boolean;
  onUpdate: (data: { name?: string; contactInfo?: string }) => void;
  onRemove: () => void;
  onManage: () => void;
}

function SupplierRow({
  supplier,
  isUpdating,
  isRemoving,
  onUpdate,
  onRemove,
  onManage,
}: SupplierRowProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(supplier.name);
  const [contactInfo, setContactInfo] = useState(supplier.contactInfo);

  function handleSave() {
    onUpdate({ name, contactInfo });
    setEditing(false);
  }

  function handleCancel() {
    setName(supplier.name);
    setContactInfo(supplier.contactInfo);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className='grid grid-cols-[1fr_1fr_auto] items-center px-4 py-3 border-b last:border-b-0 gap-4'>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className='h-8 text-sm'
          disabled={isUpdating}
        />
        <Input
          value={contactInfo}
          onChange={(e) => setContactInfo(e.target.value)}
          className='h-8 text-sm'
          disabled={isUpdating}
        />
        <div className='flex items-center gap-1'>
          <button
            onClick={handleSave}
            disabled={isUpdating}
            className='p-1.5 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30'
            title='Save'
          >
            <Check size={15} />
          </button>
          <button
            onClick={handleCancel}
            disabled={isUpdating}
            className='p-1.5 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30'
            title='Cancel'
          >
            <X size={15} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-[1fr_1fr_auto] items-center px-4 py-3 border-b last:border-b-0 gap-4'>
      <span className='text-sm font-medium'>{supplier.name}</span>
      <span className='text-sm text-muted-foreground'>
        {supplier.contactInfo}
      </span>
      <div className='flex items-center gap-1'>
        <button
          onClick={onManage}
          className='p-1.5 text-muted-foreground hover:text-foreground transition-colors'
          title='Manage meals & menu periods'
        >
          <Settings2 size={15} />
        </button>
        <button
          onClick={() => setEditing(true)}
          disabled={isRemoving}
          className='p-1.5 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30'
          title='Edit'
        >
          <Pencil size={15} />
        </button>
        <AlertDialog>
          <AlertDialogTrigger
            disabled={isRemoving}
            className='p-1.5 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30'
            title='Delete'
          >
            <Trash2 size={15} />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete supplier</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete{' '}
                <span className='font-medium'>{supplier.name}</span>? This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onRemove}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
