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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useServices } from '@/shared/infrastructure/di/service.context';
import { ISupplierResponse, Language } from '@food-up/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Pencil, Plus, Settings2, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const QUERY_KEY = ['suppliers', 'in-house'];

const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: Language.En, label: 'English' },
  { value: Language.Sr, label: 'Srpski' },
];

function languageLabel(lang: Language): string {
  return LANGUAGE_OPTIONS.find((o) => o.value === lang)?.label ?? lang;
}

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
      email?: string;
      language?: Language;
    }) => supplierService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const removeSupplier = useMutation({
    mutationFn: (id: string) => supplierService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createLanguage, setCreateLanguage] = useState<Language>(Language.En);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    createSupplier.mutate(
      { name: createName, email: createEmail, language: createLanguage },
      {
        onSuccess: () => {
          setCreateName('');
          setCreateEmail('');
          setCreateLanguage(Language.En);
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
                setCreateEmail('');
                setCreateLanguage(Language.En);
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
              <Label htmlFor='supplier-email' className='mb-1.5 block'>
                Email
              </Label>
              <Input
                id='supplier-email'
                placeholder='Email'
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
              />
            </div>
            <div className='w-36'>
              <Label className='mb-1.5 block'>Language</Label>
              <Select
                value={createLanguage}
                onValueChange={(v) => setCreateLanguage(v as Language)}
                disabled={createSupplier.isPending}
              >
                <SelectTrigger className='w-full'>
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
        <div className='grid grid-cols-[1fr_1fr_1fr_auto] text-xs font-medium text-muted-foreground bg-muted/40 px-4 py-2.5 border-b'>
          <span>Name</span>
          <span>Email</span>
          <span>Language</span>
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
  onUpdate: (data: { name?: string; email?: string; language?: Language }) => void;
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
  const [email, setEmail] = useState(supplier.email ?? '');
  const [language, setLanguage] = useState<Language>(supplier.language);

  function handleSave() {
    onUpdate({ name, email, language });
    setEditing(false);
  }

  function handleCancel() {
    setName(supplier.name);
    setEmail(supplier.email ?? '');
    setLanguage(supplier.language);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className='grid grid-cols-[1fr_1fr_1fr_auto] items-center px-4 py-3 border-b last:border-b-0 gap-4'>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className='h-8 text-sm'
          disabled={isUpdating}
        />
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='h-8 text-sm'
          disabled={isUpdating}
        />
        <Select
          value={language}
          onValueChange={(v) => setLanguage(v as Language)}
          disabled={isUpdating}
        >
          <SelectTrigger className='h-8 text-sm w-full'>
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
    <div className='grid grid-cols-[1fr_1fr_1fr_auto] items-center px-4 py-3 border-b last:border-b-0 gap-4'>
      <span className='text-sm font-medium'>{supplier.name}</span>
      <span className='text-sm text-muted-foreground'>
        {supplier.email ?? '—'}
      </span>
      <span className='text-sm text-muted-foreground'>
        {languageLabel(supplier.language)}
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
